using AutoMapper;
using Sahaai.Application.Features.RequestService.DTO;
using Sahaai.Application.Features.Users.RequesrService.DTO;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.RequestService.Mapping
{
    public class ServiceRequestProfile:Profile
    {
        public ServiceRequestProfile()
        {
            CreateMap<ServiceRequest, ServiceRequestStatusDto>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.RequestId, o => o.MapFrom(s => s.Id));

            CreateMap<ServiceRequest, ServiceRequestHistoryDto>()
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.RequestId, o => o.MapFrom(s => s.Id));



            CreateMap<ServiceRequestCreateDto, ServiceRequest>()
                .ForMember(d => d.ImageUrls, o => o.Ignore())
                .ForMember(d => d.AudioUrl, o => o.Ignore());
        }
    }
}
