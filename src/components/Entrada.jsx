import React from "react";

const Entrada = ({ children }) => {
  return (
    <div className="ticket max-w-sm mx-auto bg-[url('/priscilla.JPG')] bg-cover shadow-lg rounded-lg overflow-hidden font-semibold text-black">
      <div className="backdrop-blur-sm">
        <div className="border-b border-dashed border-plate ">
          <div className="bg-gray-800 p-4">
            <h2 className="text-2xl text-blues font-bold">
              Priscilla TOUR 2024 Perú
            </h2>
            <p className="text-gray-400">Artista: Priscilla Bueno</p>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-700 font-semibold">Fecha:</p>
              <p className="text-gray-900">9 de Junio, 2024</p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-gray-700 font-semibold">Hora:</p>
              <p className="text-gray-900">7:00 PM</p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-gray-700 font-semibold">Lugar:</p>
              <p className="text-gray-900">Ex Cine Portofino</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 p-4 flex justify-between items-center border-plate border-t border-dashed ">
          <div>
            <p className="text-gray-700">Entrada:</p>
            <p className="text-gray-900 font-bold">General</p>
          </div>
          <div>
            <p>35 s/</p>
          </div>

        </div>
        <div>
            {children}
          </div>
      </div>
    </div>
  );
};

export default Entrada;
