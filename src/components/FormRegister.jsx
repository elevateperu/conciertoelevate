import React, { useEffect, useRef, useState } from "react";
import { URL, PATHS, PUBLIC_KEY_MP, } from "../constants/url";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import axios from "axios";
import Ticket from "./Ticket";
import CardFinal from "./CardFinal";
import * as htmlToImage from "html-to-image"
import emailjs from '@emailjs/browser';
import QRCode from "react-qr-code";
import Entrada from "./Entrada";
import ReactPDF from '@react-pdf/renderer';
import Pdf from "./Pdf";

export default function FormRegister() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  console.log(params)
  initMercadoPago(PUBLIC_KEY_MP, {
    locale: "es-PE",
  });
  const formEl = useRef();
  const [load, setLoad] = useState(false);
  const [valid, setValid] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [preferenceId, setPreferenceId] = useState(null);
  const [dataModal, setDataModal] = useState({
    title:'',
    description: ''
  })
  const [dataForm, setDataForm] = useState({
    quantity: 0,
    price: 35,
    nameUser: "",
    lastName: "",
    dni: "",
    email: "",
    phone: "",
    codeTransaction: "",
  });



  function handleSubmit(event) {
    setLoad(true);
    event.preventDefault();
    const form = formEl.current;
    const auxDataForm = {
      quantity: cantidad,
      price: 35,
      nameUser: form["name"].value,
      lastName: form["lastname"].value,
      dni: form["dni"].value,
      email: form["email"].value,
      phone: form["tlf"].value,
      codeTransaction: "",
    };
    setDataForm(auxDataForm);
  }

  const createPreference = async () => {
    const data = JSON.stringify(dataForm);
    console.log(data)
    emailjs.sendForm('service_pbl292h', 'template_gkwc0l8' , dataForm, {
      publicKey: 'mCuLQJtjwLvuqp61a'
    })
    .then(
      () => {
        console.log('SUCCESS!');
      },
      (error) => {
        console.log('FAILED...', error.text);
      },
    );
    if(dataForm.quantity > 0 && dataForm.nameUser != ''){
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL.PATH_BASE + PATHS.PATH_CREATE_TICKET_NO_MP,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
  
      axios
        .request(config)
        .then((response) => {
          console.log(response.data);
          const { idMercadoPago } = response.data;
          setPreferenceId(idMercadoPago);
          setValid(true)
          return idMercadoPago;
        })
        .catch((error) => {
          console.log(error);
        });
      setLoad(false);
    }
    
  };

  useEffect(() => {
    handleBuy();
  }, [dataForm]);

  useEffect(() => {
    console.log('si nooo ')
    if(params.id){

      //const params = params.id//{ id: params.id }; // Ejemplo de parámetro
      const url = `https://www.conciertoelevate.com/getTicketByIdMercadoPago?id=${encodeURIComponent(params.id)}`;
      
      const config = {
        method: 'get',
        url: url,
        
      };
      console.log(config, 'config');
      
      axios(config)
        .then(function (response) {
          const dataRes = response.data;
          setDataModal({
            title: dataRes.status === 'approved' ? 'Gracias por la compra' : 'Error en el pago',
            description: dataRes.status === 'approved' ? 'Te enviaremos un correo electrónico <br/> con tus entradas al concierto' : 'Vuelve a intentar el pago, si ya pagó, contáctenos para poder ayudarle',
          });
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error, 'error chloe llorana');
        });

     /* var data = JSON.stringify({
        "id": params.id.toString()
      })
      console.log(data, '***')
      var config = {
        method: 'get',
        url: "https://www.conciertoelevate.com/getTicketByIdMercadoPago",
        headers: { 
          'Content-Type': 'application/json'
        },
        body : data
      };
      console.log(config, 'config')
      
      axios(config)
      .then(function (response) {
        const dataRes = response.data
        setDataModal({
          title: dataRes.status == 'approved' ? 'Gracias por la compra' : 'Error en el pago',
          description: dataRes.status == 'approved' ? 'Te enviaremos un correo electrónico <br/> con tus entradas al concierto' : 'Vuelve a intentar el pago, si ya pagó, contáctenos para poder ayudarle',
        })
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error, 'error chloe llorana');
      });*/
    }
  // const node = document.querySelector('#entrada')
  // htmlToImage.toPng(node)
  // .then(function (dataUrl) {
  //   var img = new Image();
  //   img.src = dataUrl;
  //   document.body.appendChild(img)  })
  // .catch(function (error) {
  //   console.error('oops, something went wrong!', error);
  // });
  }, []);

  const handleBuy = async () => {
    const id = await createPreference();
    if (id) {
      console.log(id);
      setPreferenceId(id);
    }
  };
  const handleTickets = (q) => {
    setCantidad(cantidad + q);
  };

  const handleDownloadPDF = () => {
    ReactPDF.render(<Pdf/>,`/ticket.pdf`)
  }
  return (
    <>
    {/* <div id="entrada">
      <Entrada>
        <QRCode value="1" size={300}/>
      </Entrada>
    </div> */}
      {(!valid && (
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 pt-[60px]">
          <form
            onSubmit={handleSubmit}
            className="relative space-y-8"
            ref={formEl}
          >
            {load && (
              <div className="absolute w-full h-full z-50 top-0 left-0 bg-black opacity-80 flex justify-center items-center overscroll-none">
                <p className="text-white">Cargando...</p>
              </div>
            )}
            <legend className="text-3xl text-plate">
              Información de apoderado de los tickets
            </legend>
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-base font-medium text-black"
              >
                Nombre
              </label>
              <input
                type="text"
                id="name"
                className="shadow-sm bg-white border text-black text-base rounded-lg focus:ring-blues focus:border-blues block w-full p-2.5"
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastname"
                className="block mb-2 text-base font-medium text-black"
              >
                Apellido
              </label>
              <input
                type="text"
                id="lastname"
                className="shadow-sm bg-white border text-black text-base rounded-lg focus:ring-blues focus:border-blues block w-full p-2.5"
                placeholder="Apellido"
                required
              />
            </div>
            <div>
              <label
                htmlFor="dni"
                className="block mb-2 text-base font-medium text-black"
              >
                Nro Documento
              </label>
              <input
                type="text"
                id="dni"
                className="shadow-sm bg-white border text-black text-base rounded-lg focus:ring-blues focus:border-blues block w-full p-2.5"
                placeholder="Nro Documento"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-base font-medium text-black"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="block p-3 w-full text-base text-black bg-white rounded-lg border shadow-sm focus:ring-blues focus:border-blues"
                placeholder="Email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="tlf"
                className="block mb-2 text-base font-medium text-black"
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="tlf"
                className="block p-3 w-full text-base text-black bg-white rounded-lg border shadow-sm focus:ring-blues focus:border-blues"
                placeholder="Teléfono"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-5 bg-blues rounded-[14px] justify-center gap-2.5 inline-flex"
            >
              <div className="text-center text-white text-xl font-normal leading-7">
                Comprar
              </div>
            </button>
            
          </form>
          <div>
            <div className="flex flex-col py-5 md:pb-10">
              <Ticket cantidad={cantidad} />
              <div className="self-center flex gap-4 pt-4">
                <button
                  className="bg-wine rounded-lg p-2 text-white"
                  disabled={cantidad == 1}
                  type="button"
                  onClick={() => handleTickets(-1)}
                >
                  Eliminar
                </button>

                <button
                  className="bg-blues rounded-lg p-2 text-white"
                  type="button"
                  onClick={() => handleTickets(+1)}
                >
                  Agregar
                </button>
              </div>
            </div>
            <h2 className="text-2xl text-center">
              Cantidad de entradas ( {cantidad} )
            </h2>
          </div>
        </div>
      )) || (
        <div className="pt-10">
          <CardFinal data={dataForm} cantidad={cantidad} >
          {preferenceId && (
              <Wallet
                initialization={{
                  preferenceId: preferenceId,
                  redirectMode: "modal",
                }}
              />
            )}
          </CardFinal>
          
        </div>
      )}
      {params.id && (
        <div className="absolute bg-black/70  w-full h-full top-0 left-0 backdrop-blur-lg flex justify-center items-center">
          <div className="bg-[url('/priscilla.JPG')] bg-cover rounded-lg text-plate overflow-hidden">
            <div className=" flex flex-col items-center gap-8 backdrop-blur-md  p-4 ">
            <p className="text-4xl">{dataModal.title}</p>
            <p className="text-xl">{dataModal.description}</p>
            <div>
              <a className="p-4 bg-blues text-white rounded-2xl justify-items-center md:justify-items-start gap-2.5 inline-flex" rel="noopener noreferrer"  href="/">
                  <h2 className="text-center text-xl font-normal leading-7">Aceptar</h2>
              </a>

            </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
