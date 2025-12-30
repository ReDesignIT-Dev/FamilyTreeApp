using FamilyTreeApp.Server.Dtos.Media;
using Microsoft.AspNetCore.Http;

namespace FamilyTreeApp.Server.Interfaces;

public interface IMediaService
{
    Task<MediaDto?> UploadMediaAsync(int treeId, int personId, IFormFile file, string mediaType, string? caption, int userId);
    Task<List<MediaDto>> GetMediaFilesAsync(int treeId, int personId, int userId);
    Task<bool> DeleteMediaAsync(int treeId, int personId, int mediaId, int userId);
}