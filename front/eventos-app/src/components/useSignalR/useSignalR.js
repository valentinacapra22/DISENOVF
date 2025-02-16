import { useEffect } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";

const useSignalR = (handleNewEvent) => {
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5125/EventoApi", {
        transport: HttpTransportType.WebSockets // Usamos HttpTransportType desde el import
      })
      .build();

    connection.on("RecibirEvento", (evento) => {
      console.log("Evento recibido:", evento); // Log para verificar la recepción del evento
      handleNewEvent(evento);
    });

    connection.start()
      .then(() => {
        console.log("✅ Conexión SignalR establecida");
      })
      .catch((err) => {
        console.error("❌ Error al conectar a SignalR: ", err);
      });

    return () => {
      connection.stop();
    };
  }, [handleNewEvent]);
};

export default useSignalR;
