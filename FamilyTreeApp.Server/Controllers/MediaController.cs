using FamilyTreeApp.Server.Dtos.Media;
using FamilyTreeApp.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FamilyTreeApp.Server.Controllers;

[ApiController]
[Route("api/trees/{treeId}/members/{personId}/media")]
[Authorize(Policy = "ActiveUserOnly")]
public class MediaController : ControllerBase
{
    private readonly IMediaService _mediaService;
    private readonly ILogger<MediaController> _logger;

    public MediaController(IMediaService mediaService, ILogger<MediaController> logger)
    {
        _mediaService = mediaService;
        _logger = logger;
    }

    // POST /api/trees/{treeId}/members/{personId}/media - Upload file
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB limit
    public async Task<ActionResult<MediaDto>> UploadMedia(
        int treeId,
        int personId,
        [FromForm] UploadMediaDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var result = await _mediaService.UploadMediaAsync(
                treeId,
                personId,
                dto.File,
                dto.MediaType,
                dto.Caption,
                userId.Value);

            if (result == null)
                return BadRequest(new { message = "Failed to upload media" });

            return CreatedAtAction(
                nameof(GetMediaFiles),
                new { treeId, personId },
                result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading media file for person {PersonId}", personId);
            return StatusCode(500, new { message = "Error uploading file" });
        }
    }

    // GET /api/trees/{treeId}/members/{personId}/media - Get files
    [HttpGet]
    public async Task<ActionResult<List<MediaDto>>> GetMediaFiles(int treeId, int personId)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _mediaService.GetMediaFilesAsync(treeId, personId, userId.Value);
        return Ok(result);
    }

    // DELETE /api/trees/{treeId}/members/{personId}/media/{id} - Delete
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedia(int treeId, int personId, int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var success = await _mediaService.DeleteMediaAsync(treeId, personId, id, userId.Value);

        if (!success)
            return NotFound(new { message = "Media file not found or access denied" });

        return NoContent();
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}