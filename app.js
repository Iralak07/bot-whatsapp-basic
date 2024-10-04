const { createBot, createProvider, createFlow, addKeyword, EVENTS} = require('@bot-whatsapp/bot')
const adapterDB = require('./database').adapterDB
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys');


// Flujo para métodos de pago
const flowPagos = addKeyword('2')
    .addAnswer('💳 *Métodos de Pago Disponibles*:\n' +
        '1. Tarjeta de Crédito (Visa, MasterCard, American Express)\n' +
        '2. Transferencia Bancaria 🏦\n' +
        '3. Pago con PayPal 💻\n\n' +
        '🔗 Para más detalles, visita: [https://bot-whatsapp.netlify.app/pagos].',
        null,
        async (_, { gotoFlow }) => {
            return gotoFlow(flowContinuar);
        }
    );

// Flujo para horarios de atención
const flowHorarios = addKeyword('1')
    .addAnswer("🕒 *Nuestro horario de atención es*:\n" +
        "De lunes a viernes, de 9:00 a.m. a 6:00 p.m. 🛍️",
        {
            capture: true,
            idle: 5000,
        },
        async (_, { gotoFlow }) => {
            return gotoFlow(flowContinuar);
        }
    );

// Flujo para disponibilidad de producto
const flowDisponibilidad = addKeyword('3')
    .addAnswer(
        '👗 *Selecciona una categoría de ropa para verificar la disponibilidad*:\n' +
        '1. Camisas 👕\n' +
        '2. Pantalones 👖\n' +
        '3. Vestidos 👗\n' +
        '4. Chaquetas 🧥\n' +
        '5. Ropa Deportiva 🏋️\n' +
        '6. Accesorios 🎒\n' +
        '7. Zapatos 👟',
        { capture: true, idle: 50000 },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            if (ctx?.idleFallBack) {
                return gotoFlow(flowInactividad);
            }
            const opciones = ['1', '2', '3', '4', '5', '6', '7'];
            if (!opciones.includes(ctx.body)) {
                return fallBack('❌ Opción no válida, por favor intenta de nuevo.');
            }
            await flowDynamic('🔍 *Verificando disponibilidad...*');
            await flowDynamic('📦 *Disponibilidad según el inventario de la tienda*.');
            return gotoFlow(flowContinuar);
        }
    );

// Flujo para costo de envío
const flowEnvio = addKeyword('4')
    .addAnswer('🚚 *Costos de Envío* según tu ubicación:\n' +
        '1. Ciudad de Santiago: $3,000 CLP 🏙️\n' +
        '2. Otras regiones: entre $4,000 y $7,000 CLP 🌍',
        null,
        async (_, { gotoFlow }) => {
            return gotoFlow(flowContinuar);
        }
    );

// Flujo para política de devolución
const flowDevolucion = addKeyword('5')
    .addAnswer('🔄 *Política de Devolución*:\n' +
        'Puedes devolver cualquier artículo dentro de los 30 días posteriores a la compra, siempre que esté en su estado original 📦.\n' +
        'Para más detalles o iniciar el proceso, visita nuestra página de devoluciones.',
        null,
        async (_, { gotoFlow }) => {
            return gotoFlow(flowContinuar);
        }
    );

// Flujo para promociones actuales
const flowPromociones = addKeyword('6')
    .addAnswer('🎉 *Promociones Actuales*:\n' +
        '¡Disfruta de un 20% de descuento en nuestra colección de verano! 🌞\n' +
        '📅 Válido hasta fin de mes, ¡no te lo pierdas!',
        null,
        async (_, { gotoFlow }) => {
            return gotoFlow(flowContinuar);
        }
    );

// Flujo para ubicación de la tienda física
const flowUbicacion = addKeyword('7')
    .addAnswer('📍 *Ubicación de nuestra tienda física*:\n' +
        'Estamos en Av. Providencia 1234, Santiago 🛒.\n' +
        'Te enviaré la ubicación por WhatsApp para que puedas encontrarnos fácilmente.',
        null,
        async (_, { gotoFlow }) => {
            return gotoFlow(flowContinuar);
        }
    );

// Flujo para asistencia en realizar un pedido
const flowPedido = addKeyword('8')
    .addAnswer('🛒 *¿Cómo realizar un pedido?*\n' +
        '1️⃣ Selecciona el producto que deseas comprar, elige la talla y cantidad.\n' +
        '2️⃣ Haz clic en "Añadir al carrito".\n' +
        '3️⃣ Cuando estés listo, ve al carrito y haz clic en "Proceder con la compra".',
        null,
        async (_, { gotoFlow }) => {
            return gotoFlow(flowContinuar);
        }
    );

// Flujo para ver el catálogo en PDF
const flowCatalogo = addKeyword('9')
    .addAnswer('📄 *Catálogo en PDF*',
        {
            media: "https://norulessports.com/wp-content/uploads/2021/07/INSTITUCION-CATALOGO_ROPA_DEPORTIVA_NR.pdf?srsltid=AfmBOorRPiwbXIK3lZQOKerOkXSvXXb7HMebIID-e5zTku5iJJswtI3h"
        },
        async (_, { gotoFlow }) => {
            return gotoFlow(flowContinuar);
        }
    );

// Flujo de cancelación por inactividad
const flowInactividad = addKeyword(EVENTS.ACTION)
    .addAnswer('❌ Conversación cancelada por inactividad.');

// Flujo para terminar la conversación
const flowTerminar = addKeyword(EVENTS.ACTION)
    .addAction(
        async (_, { endFlow }) => {
            return endFlow("👋 ¡Gracias por visitarnos! La conversación ha terminado.");
        }
    );

// Flujo para continuar
const flowContinuar = addKeyword(EVENTS.ACTION)
    .addAnswer(
        '💬 *¿Te gustaría hacer otra consulta?*\n' +
        '1. Sí ✅\n' +
        '2. No ❌',
        {
            capture: true,
            idle: 50000
        },
        async (ctx, { fallBack, gotoFlow }) => {
            if (ctx?.idleFallBack) {
                return gotoFlow(flowInactividad);
            }
            if (ctx?.body === '1') {
                return gotoFlow(flowPrincipal);
            }
            if (ctx?.body === '2') {
                return gotoFlow(flowTerminar);
            }
            return fallBack('❌ Opción no válida, por favor intenta de nuevo.');
        }
    );

// Flujo principal
const flowPrincipal = addKeyword(EVENTS.ACTION)
    .addAnswer(
        '🔽 *Selecciona una opción*:\n' +
        '1. Horarios de Atención 🕒\n' +
        '2. Métodos de Pago 💳\n' +
        '3. Disponibilidad de Producto 👗\n' +
        '4. Costo de Envío 🚚\n' +
        '5. Política de Devolución 🔄\n' +
        '6. Promociones Actuales 🎉\n' +
        '7. Ubicación de la Tienda 📍\n' +
        '8. Asistencia para Realizar un Pedido 🛒\n' +
        '9. Ver Catálogo en PDF 📄',
        {
            capture: true,
            idle: 50000, // 50000 milisegundos son 5 segundos
        },
        async (ctx, { fallBack, gotoFlow }) => {
            if (ctx?.idleFallBack) {
                return gotoFlow(flowInactividad);
            }
            const opciones = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
            if (!opciones.includes(ctx.body)) {
                return fallBack('❌ Opción no válida, por favor intenta de nuevo.');
            }
        },
        [
            flowHorarios,
            flowPagos,
            flowDisponibilidad,
            flowEnvio,
            flowDevolucion,
            flowPromociones,
            flowUbicacion,
            flowPedido,
            flowCatalogo
        ]
    );

// Flujo de bienvenida
const flowBienvenida = addKeyword('demo')
    .addAnswer('👋 *¡Bienvenido a nuestra tienda de ropa online!*', null, async (_, { gotoFlow }) => {
         return gotoFlow(flowPrincipal);
    });



const main = async () => {
    const adapterFlow = createFlow([flowBienvenida, flowPrincipal,flowInactividad, flowTerminar, flowContinuar])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()