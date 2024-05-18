import React from "react";
import Ticket from "./Ticket";

const CardFinal = ({ cantidad, data, children }) => {
  return (
    <div className="grid grid-cols-2">
      <div>
        <h1 className="text-3xl text-plate">
          Información de apoderado de los tickets
        </h1>
        <div className="mt-4 p-4 bg-[#f2f2f2] rounded-xl text-plate">
          <p className="font-bold flex justify-between">
            Nombre: <span className="font-normal ">{data.nameUser}</span>{" "}
          </p>
          <p className="font-bold flex justify-between">
            Apellido: <span className="font-normal ">{data.lastName}</span>{" "}
          </p>
          <p className="font-bold flex justify-between">
            Documento: <span className="font-normal ">{data.dni}</span>{" "}
          </p>
          <p className="font-bold flex justify-between">
            Email: <span className="font-normal ">{data.email}</span>{" "}
          </p>
          <p className="font-bold flex justify-between">
            Teléfono: <span className="font-normal ">{data.phone}</span>{" "}
          </p>
        </div>
        {children}
      </div>
      <div >
        <Ticket cantidad={cantidad}></Ticket>
        <p className="text-center text-2xl font-bold text-blues"> Cantidad de entradas ( {cantidad} )</p>
      </div>
    </div>
  );
};

export default CardFinal;
