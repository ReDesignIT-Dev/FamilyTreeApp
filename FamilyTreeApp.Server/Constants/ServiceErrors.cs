namespace FamilyTreeApp.Server.Constants;

public static class ServiceErrors
{
    public const string FamilyTreeNotFound = "Family tree not found";
    public const string PersonNotFound = "Person not found";
    public const string PersonNotFoundInTree = "Person not found in this tree";
    public const string NoEditPermission = "You don't have permission to edit this tree";
    public const string NoAccessPermission = "You don't have access to this tree";
    public const string CannotRemoveOwner = "Cannot remove the owner from their own tree";
    public const string PersonHasRelationships = "Cannot remove person with existing relationships. Remove relationships first.";
    public const string DeathBeforeBirth = "Death date cannot be before birth date";
    public const string InvalidGender = "Invalid gender. Allowed values: Male, Female.";
}