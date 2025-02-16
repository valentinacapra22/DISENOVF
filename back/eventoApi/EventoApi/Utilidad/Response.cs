using System.Globalization;



namespace EventoApi.Utilidad
{
    public class Response<T>
    {
        public bool status { get; set; }
        public string? msg { get; set; } = string.Empty;
        public string? token { get; set; } = string.Empty;
        public T? value { get; set; }

        public string? message { get; set; }
    }
}