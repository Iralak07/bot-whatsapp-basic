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
const flujoIncial = addKeyword('demo', { sensitive: true })
    .addAction(async (ctx, ctxFn) => {
        return ctxFn.gotoFlow(flujoBienvenida)
    })

const flujoBienvenida = addKeyword(EVENTS.ACTION)
    .addAnswer('👋 ¡Hola! Bienvenido/a*, tu asistente virtual está aquí para ayudarte.', 
        { delay: 1000 }
    )
    .addAnswer('🔑 Por favor, ingresa tu número de *RUT* con guion y dígito verificador. \n\n' +
        'Ejemplo: *16.012.123-4*',
        { capture: true },
        async (ctx, ctxFn) => {
            const rut = ctx.body.trim(); // Eliminar espacios adicionales, si los hubiera
            const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9Kk]{1}$/;
            const rutValido = rutRegex.test(rut);
            if (!rutValido) {
                return ctxFn.fallBack('Por favor, ingresa tu número de *RUT* con guion y dígito verificador. \n\n' +
                    'Ejemplo: *16.012.123-4*');
            }
            const query = `SELECT * FROM userbot WHERE ruc = '${rut}'`;
            const user = await adapterDB.db.query(query);

            if (!user.rows.length) {
                await ctxFn.flowDynamic('⚠️ *Aun no te encuentras registrado*.');
                await ctxFn.state.update({ rut });
                return ctxFn.gotoFlow(flujoNombreUsario);
            }

            // Actualizar estado del usuario
            await ctxFn.state.update({ 
                rut, 
                nombre: user.rows[0].fullname, 
                comuna: user.rows[0].comuna, 
                direccion: user.rows[0].direccion 
            });

            // Saludar al usuario registrado
            await ctxFn.flowDynamic(`Hola *${ctxFn.state.get('nombre')}* 😀, encantado/a de ayudarte.`);
            await ctxFn.gotoFlow(flowPrincipal);
        }
    );

const flujoNombreUsario = addKeyword(EVENTS.ACTION)
    .addAnswer('Por favor, ingrese su nombre completo. Ejemplo: *JUAN PEREZ*', {
        capture: true,
    },
    async (ctx, ctxFn) => {
        const nombre = ctx.body
        if(!nombre){
            return ctxFn.fallBack('Por favor, ingrese su nombre completo. Ejemplo: *JUAN PEREZ*')
        }
        await ctxFn.state.update({ nombre: nombre })
        await ctxFn.state.update({ telefono: ctx.from })
        return ctxFn.gotoFlow(flujoTerminosCondiciones);
    }

)

const flujoTerminosCondiciones = addKeyword(EVENTS.ACTION)
    .addAnswer('*Aceptación de Términos y Condiciones:*')
    .addAnswer('👉 Autorizo el tratamiento de mis datos personales con la finalidad de prestar servicios con fines estadísticos, de marketing, comunicar ofertas y promociones, y con el objeto de entregar información y/o beneficios de la empresa. Este contacto podrá ser telefónico, mensaje de texto, correo electrónico o WhatsApp. Los datos podrán, en casos concretos, ser comunicados a terceros para cumplir con las finalidades mencionadas.')
    .addAnswer('Para continuar con el registro, por favor acepte los siguientes T&C.') 
    .addAnswer(
        'Ingrese *1* para aceptar los T&C. ✅\n' +
        'Ingrese *2* para rechazar los T&C. ❌\n',
        { 
            delay: 1000, 
            capture: true,
        },    
        async (ctx, ctxFn) => {
            const opciones = ['1', '2']
            if (!opciones.includes(ctx.body)) {
                return ctxFn.fallBack('⚠️ Opción inválida. Ingrese *1* para aceptar los T&C. ✅\n\n' +
                    'Ingrese *2* para rechazar los T&C. ❌')
            }
            switch (ctx.body) {
                case '1':
                    return ctxFn.gotoFlow(flujoEmail)
                case '2':
                    await ctxFn.flowDynamic('¡Hasta pronto! 👋')
                    return ctxFn.endFlow()
            }
        }
    )
const flujoEmail = addKeyword(EVENTS.ACTION)
    .addAnswer('Por favor, ingrese su correo electrónico. Ejemplo: *bWdX0@example.com*', {
        capture: true,
    },
    async (ctx, ctxFn) => {
        const email = ctx.body
        if(!email){
            return ctxFn.fallBack('Por favor, ingrese su correo electrónico. Ejemplo: *bWdX0@example.com*')
        }
        await ctxFn.state.update({ email: email })
        return ctxFn.gotoFlow(flujoConfirmarRegistro);
    }
)

const flujoConfirmarRegistro = addKeyword(EVENTS.ACTION)
    .addAnswer('✅ *Confirmar registro de usuario:*\n\n' +
        'Seleccione:\n\n' +
        '1️⃣  *Confirmar registro.* ✅\n' +
        '2️⃣  *Modificar registro.* ❌\n',
        {
            capture: true,
        },
        async (ctx, ctxFn) => {
            const opciones = ['1', '2']
            
            // Validación de opciones
            if (!opciones.includes(ctx.body)) {
                return ctxFn.fallBack(
                    '⚠️ *Opción inválida.*\n\n' +
                    'Seleccione:\n' +
                    '1️⃣  *Confirmar registro.* ✅\n' +
                    '2️⃣  *Modificar registro.* ❌\n'
                );
            }

            // Control de flujo según opción seleccionada
            switch (ctx.body) {
                case '1':
                    return ctxFn.gotoFlow(flujoGuardarRegistro);
                case '2':
                    return ctxFn.gotoFlow(flujoEmail);
            }
        }
    );


    const flujoGuardarRegistro = addKeyword(EVENTS.ACTION)
    .addAnswer('Registrando usuario... ⏳', 
        { delay: 1000 },
        async (ctx, ctxFn) => {
            const query = `INSERT INTO userbot (fullname, ruc, telefono, comuna, direccion) VALUES 
                        ('${ctxFn.state.get('nombre')}',
                         '${ctxFn.state.get('rut')}',
                          '${ctxFn.state.get('telefono')}',
                          '',
                          '')
`
            
            const result = await adapterDB.db.query(query)
            if (result) {
                await ctxFn.flowDynamic(`🎉 ¡Bienvenido/a, ${ctxFn.state.get('nombre')}!`)
                return ctxFn.gotoFlow(flowPrincipal)
            } else {
                return ctxFn.fallBack('⚠️ No se pudo registrar el usuario. Por favor, intente nuevamente.')
            }
        }
    )



const main = async () => {
    const adapterFlow = createFlow([
        flujoBienvenida,
        flujoIncial,
        flowPrincipal,
        flowInactividad,
        flowTerminar,
        flowContinuar,
        flujoTerminosCondiciones,
        flujoEmail,
        flujoConfirmarRegistro,
        flujoGuardarRegistro,
        flujoNombreUsario
    ])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()