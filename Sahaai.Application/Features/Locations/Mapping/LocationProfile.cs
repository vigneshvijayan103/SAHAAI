using AutoMapper;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.Mapping
{
    public class LocationProfile:Profile
    {
        public LocationProfile()
        {
            CreateMap<UpdateLocationDto, UserLocation>()
             .ForMember(dest => dest.UserId, opt => opt.Ignore())
             .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));



            CreateMap<UpdateLocationDto, UserLocationHistory>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(src => DateTime.UtcNow));
            



            CreateMap<UserLocation, LocationResponseDto>();
            CreateMap<UserLocationHistory, LocationResponseDto>();
        }
    }
}
