using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.Media;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace FamilyTreeApp.Server.Services;

public class MediaService : IMediaService
{
    private readonly FamilyTreeContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<MediaService> _logger;
    private readonly IConfiguration _configuration;

    private static readonly HashSet<string> AllowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"
    };

    private static readonly HashSet<string> AllowedDocumentExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".doc", ".docx", ".txt", ".odt"
    };

    private static readonly HashSet<string> AllowedVideoExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".mp4", ".avi", ".mov", ".wmv", ".webm"
    };

    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public MediaService(
        FamilyTreeContext context,
        IWebHostEnvironment environment,
        ILogger<MediaService> logger,
        IConfiguration configuration)
    {
        _context = context;
        _environment = environment;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<MediaDto?> UploadMediaAsync(
        int treeId,
        int personId,
        IFormFile file,
        string mediaType,
        string? caption,
        int userId)
    {
        // Verify tree exists and user has edit access
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
        {
            _logger.LogWarning("Tree {TreeId} not found", treeId);
            return null;
        }

        if (!await CanEditTree(tree, userId))
        {
            _logger.LogWarning("User {UserId} does not have edit access to tree {TreeId}", userId, treeId);
            return null;
        }

        // Verify person is in this tree
        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
        {
            _logger.LogWarning("Person {PersonId} not found in tree {TreeId}", personId, treeId);
            return null;
        }

        var person = await _context.People.FindAsync(personId);
        if (person == null)
        {
            _logger.LogWarning("Person {PersonId} not found", personId);
            return null;
        }

        // Validate file
        if (file == null || file.Length == 0)
            throw new InvalidOperationException("No file uploaded");

        if (file.Length > MaxFileSize)
            throw new InvalidOperationException($"File size exceeds maximum limit of {MaxFileSize / 1024 / 1024} MB");

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension))
            throw new InvalidOperationException("File must have an extension");

        // Validate file type matches media type
        var isValidType = mediaType switch
        {
            "Photo" => AllowedImageExtensions.Contains(extension),
            "Document" => AllowedDocumentExtensions.Contains(extension),
            "Video" => AllowedVideoExtensions.Contains(extension),
            _ => false
        };

        if (!isValidType)
            throw new InvalidOperationException($"Invalid file type for {mediaType}");

        try
        {
            // Compute hash for deduplication (similar to your FileStorageService)
            string hash;
            using (var sha256 = SHA256.Create())
            using (var stream = file.OpenReadStream())
            {
                var hashBytes = await sha256.ComputeHashAsync(stream);
                hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
            }

            // Create uploads directory structure
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", "media", personId.ToString());
            Directory.CreateDirectory(uploadsPath);

            // Use hash-based filename (prevents duplicates)
            var uniqueFileName = $"{hash}{extension}";
            var filePath = Path.Combine(uploadsPath, uniqueFileName);
            var relativeFilePath = $"/uploads/media/{personId}/{uniqueFileName}";

            // Save file only if it doesn't exist
            if (!File.Exists(filePath))
            {
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }
                _logger.LogInformation("Saved new file: {FilePath}", relativeFilePath);
            }
            else
            {
                _logger.LogInformation("File already exists (hash match): {FilePath}", relativeFilePath);
            }

            // Create media record
            var media = new Media
            {
                PersonId = personId,
                FileName = file.FileName,
                FilePath = relativeFilePath,
                Caption = caption?.Trim(),
                MediaType = mediaType,
                UploadedAt = DateTime.UtcNow
            };

            _context.MediaFiles.Add(media);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "User {UserId} uploaded {MediaType} {MediaId} for person {PersonId} in tree {TreeId}",
                userId, mediaType, media.Id, personId, treeId);

            return MapToMediaDto(media);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading media file for person {PersonId}", personId);
            throw;
        }
    }

    public async Task<List<MediaDto>> GetMediaFilesAsync(int treeId, int personId, int userId)
    {
        // Verify tree exists and user has access
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
        {
            _logger.LogWarning("Tree {TreeId} not found", treeId);
            return new List<MediaDto>();
        }

        if (!await HasAccessToTree(tree, userId))
        {
            _logger.LogWarning("User {UserId} does not have access to tree {TreeId}", userId, treeId);
            return new List<MediaDto>();
        }

        // Verify person is in this tree
        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
        {
            _logger.LogWarning("Person {PersonId} not found in tree {TreeId}", personId, treeId);
            return new List<MediaDto>();
        }

        var mediaFiles = await _context.MediaFiles
            .Where(m => m.PersonId == personId)
            .OrderByDescending(m => m.UploadedAt)
            .ToListAsync();

        return mediaFiles.Select(MapToMediaDto).ToList();
    }

    public async Task<bool> DeleteMediaAsync(int treeId, int personId, int mediaId, int userId)
    {
        // Verify tree exists and user has edit access
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
        {
            _logger.LogWarning("Tree {TreeId} not found", treeId);
            return false;
        }

        if (!await CanEditTree(tree, userId))
        {
            _logger.LogWarning("User {UserId} does not have edit access to tree {TreeId}", userId, treeId);
            return false;
        }

        // Verify person is in this tree
        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
        {
            _logger.LogWarning("Person {PersonId} not found in tree {TreeId}", personId, treeId);
            return false;
        }

        var media = await _context.MediaFiles
            .FirstOrDefaultAsync(m => m.Id == mediaId && m.PersonId == personId);

        if (media == null)
        {
            _logger.LogWarning("Media {MediaId} not found for person {PersonId}", mediaId, personId);
            return false;
        }

        try
        {
            // Delete physical file
            var fullPath = Path.Combine(_environment.ContentRootPath, media.FilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("Deleted physical file: {FilePath}", fullPath);
            }

            // Delete database record
            _context.MediaFiles.Remove(media);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "User {UserId} deleted media {MediaId} for person {PersonId} in tree {TreeId}",
                userId, mediaId, personId, treeId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting media file {MediaId}", mediaId);
            return false;
        }
    }

    // Helper methods
    private async Task<bool> HasAccessToTree(FamilyTree tree, int userId)
    {
        if (tree.OwnerId == userId)
            return true;

        if (tree.IsPublic)
            return true;

        var isCollaborator = await _context.TreeCollaborators
            .AnyAsync(tc => tc.FamilyTreeId == tree.Id && tc.UserId == userId);

        return isCollaborator;
    }

    private async Task<bool> CanEditTree(FamilyTree tree, int userId)
    {
        if (tree.OwnerId == userId)
            return true;

        var collaborator = await _context.TreeCollaborators
            .FirstOrDefaultAsync(tc => tc.FamilyTreeId == tree.Id && tc.UserId == userId);

        return collaborator?.Permission is "Edit" or "Admin";
    }

    private MediaDto MapToMediaDto(Media media)
    {
        return new MediaDto
        {
            Id = media.Id,
            PersonId = media.PersonId,
            FileName = media.FileName,
            FilePath = media.FilePath,
            Caption = media.Caption,
            MediaType = media.MediaType,
            UploadedAt = media.UploadedAt
        };
    }
}