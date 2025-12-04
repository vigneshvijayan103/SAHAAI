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
    public class AddressProfile:Profile
    {
        public AddressProfile()
        {
            CreateMap<AddAddressDto,UserAddress>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedOn, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateAddressDto, UserAddress>()
               .ForMember(dest => dest.Id, opt => opt.Ignore())
               .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
               .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
               .ForMember(dest => dest.DeletedOn, opt => opt.Ignore())
               .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
               .ForMember(dest => dest.UserId, opt => opt.Ignore())
               .ForAllMembers(opts =>
                    opts.Condition((src, dest, srcMember) =>
                        srcMember != null && !(srcMember is double d && d == 0)));

            CreateMap<UserAddress, AddressResponseDto>();

        }
    }
}
