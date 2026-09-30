using AutoMapper;
using Sahaai.Application.Features.Workers.DTO;
using Sahaai.Domain.Entities;

namespace Sahaai.Application.Features.Workers.Mapping
{
    public class WorkerMappingProfile : Profile
    {
        public WorkerMappingProfile()
        {
            CreateMap<WorkerRegisterDto, User>()
                .ForMember(dest => dest.Role, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.Login, opt => opt.Ignore())
                .ForMember(dest => dest.WorkerDetails, opt => opt.Ignore());

            CreateMap<WorkerDetails, WorkerProfileDto>()
                .ForMember(dest => dest.WorkerId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : string.Empty))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : string.Empty))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.User != null ? src.User.Phone : string.Empty))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null && src.User.Login != null ? src.User.Login.Username : string.Empty))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.User != null && src.User.IsActive));
        }
    }
}

