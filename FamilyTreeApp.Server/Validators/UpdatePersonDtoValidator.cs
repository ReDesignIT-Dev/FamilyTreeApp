using FluentValidation;
using FamilyTreeApp.Server.Dtos.Person;

namespace FamilyTreeApp.Server.Validators;

public class UpdatePersonDtoValidator : AbstractValidator<UpdatePersonDto>
{
    public UpdatePersonDtoValidator()
    {
        RuleFor(x => x.FirstName)
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .MaximumLength(100);

        RuleFor(x => x.MiddleName)
            .MaximumLength(100);

        RuleFor(x => x.MaidenName)
            .MaximumLength(100);

        RuleFor(x => x.BirthPlace)
            .MaximumLength(200);

        RuleFor(x => x.DeathPlace)
            .MaximumLength(200);

        RuleFor(x => x.Gender)
            .IsInEnum()
            .When(x => x.Gender.HasValue);

        RuleFor(x => x.Biography)
            .MaximumLength(5000);

        // At least one name required
        RuleFor(x => x)
            .Custom((dto, context) =>
            {
                if (string.IsNullOrWhiteSpace(dto.FirstName) &&
                    string.IsNullOrWhiteSpace(dto.LastName))
                {
                    context.AddFailure("At least one of FirstName or LastName must be provided.");
                }
            });
    }
}
