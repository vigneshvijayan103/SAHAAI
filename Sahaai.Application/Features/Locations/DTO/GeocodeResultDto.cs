namespace Sahaai.Application.Features.Locations.DTO
{
    public class GeocodeResultDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? DisplayName { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Pincode { get; set; }
    }
}

