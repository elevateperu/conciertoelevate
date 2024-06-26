import React, { useEffect, useRef, useState } from "react";
import { URL, PATHS, PUBLIC_KEY_MP } from "../constants/url";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import axios from "axios";
import Ticket from "./Ticket";
import CardFinal from "./CardFinal";
import * as htmlToImage from "html-to-image";
import emailjs from "@emailjs/browser";
import QRCode from "react-qr-code";
import Entrada from "./Entrada";
import ReactPDF from "@react-pdf/renderer";
import Pdf from "./Pdf";
import {
  PDFDownloadLink,
  Page,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

export default function FormRegister() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  console.log(params);
  initMercadoPago(PUBLIC_KEY_MP, {
    locale: "es-PE",
  });
  const formEl = useRef();
  const toImageElem = useRef();
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [validTickets, setValidTickets] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [preferenceId, setPreferenceId] = useState(null);
  const [listQR, setListQR] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [viewTickets, setViewTickets] = useState(false);
  const link = useRef();
  const [dataEmail, setDataEmail] = useState({});
  const [listIdQr, setListIdQr] = useState([
    {
      incomeStatus: false,
      ticketId: "0",
      _id: "0",
    },
  ]);
  const [dataModal, setDataModal] = useState({
    title: "",
    description: "",
    button: "",
  });
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
    console.log(data);

    if (dataForm.quantity > 0 && dataForm.nameUser != "") {
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
          setValid(true);
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
    if (params.id) {
      setOpenModal(true);
      const url = `https://www.conciertoelevate.com/getTicketByIdMercadoPago?id=${encodeURIComponent(
        params.id
      )}`;

      const config = {
        method: "get",
        url: url,
      };
      axios(config)
        .then(function (response) {
          const dataRes = response.data;
          setDataModal({
            title:
              dataRes.status === "approved"
                ? "Gracias por la compra"
                : "Error en el pago",
            description:
              dataRes.status === "approved"
                ? "Puedes ver tus entradas, descargarlas o enviar a tu correo, ¡Click en el siguiente botón!"
                : "Vuelve a intentar el pago, si ya pagó, contáctenos para poder ayudarle",
            button:
              dataRes.status === "approved"
                ? "Ver mis entradas"
                : "Aceptar",
          });
          if (dataRes.status == "approved") {
            setValidTickets(true);
          }
          console.log(response.data.tickets);
          setListIdQr(response.data.tickets);
          setDataEmail(response.data);
        })
        .catch(function (error) {
          console.log(error, "error chloe llorana");
        });
    }
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

  const handleCreatePDF = async () => {
    await setViewTickets(true);
    setLoading(true);
    setTimeout(() => {
      htmlToImage
        .toPng(toImageElem.current)
        .then(function (dataUrl) {
          var img = new Image();
          img.src = dataUrl;
          console.log(dataUrl);
          setListQR([dataUrl]);
        })
        .catch(function (error) {
          console.error("oops, something went wrong!", error);
        })
        .finally(function () {
          setShowButton(true);
          setLoading(false);
        });
    }, 2000);
  };

  const handleSendEmail = () => {
    setLoading(true);
    const blob = document.querySelector("#link").href;
    let urlPDF;
    console.log({ dataEmail });
    fetch(blob)
      .then((response) => response.blob())
      .then((blob) => blobToBase64(blob))
      .then((base64String) => {
        emailjs
          .send(
            "service_pbl292h",
            "template_gkwc0l8",
            {
              nameUser: dataEmail.nameUser,
              lastName: dataEmail.lastName,
              email: dataEmail.email,
              pdf: base64String,
            },
            {
              publicKey: "mCuLQJtjwLvuqp61a",
            }
          )
          .then(
            () => {
              console.log("SUCCESS!");
              setLoading(false);
              alert("Correo enviado");
            },
            (error) => {
              console.log("FAILED...", error.text);
              setLoading(false);
              alert("Error al enviar correo");
            }
          );
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
        alert("Hubo un error al generar su ticket");
      });
  };

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return (
    <>
      {(!valid && !validTickets && (
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
                name="nameUser"
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
                name="lastName"
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
                name="dni"
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
                name="email"
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
                name="tlf"
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
      )) ||
        (valid && !validTickets && (
          <div className="pt-10">
            <CardFinal data={dataForm} cantidad={cantidad}>
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
        )) ||
        (validTickets && (
          <div className="min-h-[500px]">
            <div className="pt-[30px]">
              <span
                onClick={() => handleCreatePDF()}
                className="bg-blues rounded-xl z-40 p-4 cursor-pointer text-3xl text-white"
              >
                Ver mis entradas +{" "}
              </span>
            </div>
            {viewTickets && (
              <div>
                <div className="max-h-[400px] overflow-scroll ">
                  <div className="" ref={toImageElem}>
                    {listIdQr &&
                      listIdQr?.map((item, key) => (
                        <Entrada key={key}>
                          <QRCode value={item?.ticketId} size={300} />
                        </Entrada>
                      ))}
                  </div>
                </div>
                {showButton && (
                  <div>
                    <PDFDownloadLink
                      document={<Pdf images={listQR}></Pdf>}
                      fileName="tickets.pdf"
                      className="bg-wine p-4 text-white rounded-xl"
                      ref={link}
                      id="link"
                    >
                      {({ blob, url, loading, error }) =>
                        loading ? "Loading document..." : "Descargar PDF"
                      }
                    </PDFDownloadLink>
                    <button
                      onClick={handleSendEmail}
                      className="bg-blues p-4 text-white rounded-xl"
                    >
                      Enviar a mi correo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      {openModal && (
        <div className="absolute z-50 bg-black/70  w-full h-full top-0 left-0 backdrop-blur-lg flex justify-center items-center">
          <div className="bg-[url('/priscilla.JPG')] bg-cover md:max-w-[380px] rounded-lg text-plate overflow-hidden">
            <div className=" flex flex-col items-center gap-8 backdrop-blur-md  p-4 ">
              <p className="text-4xl">{dataModal.title}</p>
              <p className="text-xl">{dataModal.description}</p>
              <div>
                <span
                  className="p-4 bg-blues text-white rounded-2xl justify-items-center md:justify-items-start gap-2.5 inline-flex cursor-pointer"
                  onClick={() => setOpenModal(false)}
                >
                  <h2 className="text-center text-xl font-normal leading-7">
                    {dataModal.button}
                  </h2>
                </span>
                {/* <PDFDownloadLink
                  document={<Pdf images={listQR}></Pdf>}
                  fileName="tickets.pdf"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? "Loading document..." : "Download now!"
                  }
                </PDFDownloadLink> */}
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="absolute bg-black/70 flex justify-center items-center top-0 left-0 w-full h-full z-[999999999999]">
          <p className="bg-[#f2f2f2] text-xl p-4 rounded-xl">Cargando...</p>
        </div>
      )}
    </>
  );
}
