using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Domain.Enums
{
    public enum ServiceRequestStatus
    {
        Pending = 1,          
        Searching = 2,       
        ExpandingRadius = 3,  
        Accepted = 4,         
        InProgress = 5,      
        Completed = 6,       
        Cancelled = 7,      
        NoWorkersAvailable = 8
    }
}
    