using AutoMapper;
using Sahaai.Application.Features.Services.DTO;
using Sahaai.Application.Features.Services.DTO.ServiceManage;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Services.Mapping
{
    public class ServiceProfile:Profile
    {
        public ServiceProfile()
        {
            CreateMap<Service, ServiceResponseDto>();

            CreateMap<CreateServiceDto, Service>()
                .ForMember(dest => dest.ImageUrl, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateServiceDto, Service>()
                 .ForMember(dest => dest.ImageUrl, opt => opt.Ignore())
                 .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore())
                 .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                 .ForAllMembers(opt =>
                     opt.Condition((src, dest, srcMember) => srcMember != null));

        }
    }
}
