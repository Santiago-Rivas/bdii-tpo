# BDII TPO

La estructura del proyecto esta divida en tres directorios principales.
Los directorios de postgresql y mongodb que contiene todos los archivos relacionados a dichas bases de datos respectivamente. En el directorio de postgresql se puede encotrar el script para popular la base de datos, los queries y el script que crea todas las vistas.
Finalmente se encuentra el directorio api que contiene los archivos relacionados a la api de Express.

## PostrgeSQL

Para popular la base de datos se puede correr el script de sql: ITBA_2023_esquema_facturacion.sql

Para hacerlo correr los siguientes comandos de linux parados desde la ruta del proyecto.

```sh
cd postgresql
psql -h localhost -p 5432 -U username --single-transaction -f ITBA_2023_esquema_facturacion.sql databasename
```

Asegurarse de remplazar username y databasename con los correctos nombres the usuario y nombre de la base de datos que quiere popular.
Este script puede no funcionar si la base de datos esta ya poblada.

### Consultas

Los queries se pueden correr todos a la vez con el script llamado consultas.sql

```sh
cd postgresql
psql -h localhost -p 5432 -U username --single-transaction -f consultas.sql databasename
```

Tambien puede correr individualmente cada consulta ya que estan guardadas dentro del directorio postgresql/queries

### Vistas

Para crear las vistas puede correr el script llamado vistas.sql

```sh
cd postgresql
psql -h localhost -p 5432 -U username --single-transaction -f vistas.sql databasename
```

## MongoDB

Para poder ejecutar las consultas en necesario hacer la transferencia de datos de la base en postgres. Para hacer esto existen dos posibilidades.
La primera es a traves del endpoint provisto por la api: /psql-to-mongo.
La segunda manera es utilizando un script en el directorio api que se llama transfer.js del siguiente modo:

```sh
cd api
node transfer.js
```

IMPORTANTE: El script hace un drop de las tablas ya existentes de la base de datos de mongo antes de insertar los datos de postgres!
Si no quiere perder datos ya existentes no corra el script.

Las consultas estan dentro de un subdirectorio llamado queries, mientras que las vistas estan dentro de un subdirectorio llamado views

## API

Antes de correr la api se deben descargar las dependencias:

```
cd api
npm install
```

Ademas hay un archivo .env en el directorio api que contiene vairables globales como el puerto y el nombre de usuario (entre otras) para acceder a la base de datos. Alli se debe colocar la informacion correcta o si no la api no funcionara.

Para prender la api correr el script the javascript dentro del directorio api llamado api.js

```sh
cd api
node api.js
```
Luego cada route hace las siguientes operaciones:

1. `/postgresql/init-db` (GET):
   - Esta ruta ejecuta un script SQL para inicializar la base de datos PostgreSQL.
   - Responde con un mensaje de éxito o un mensaje de error en caso de problemas.

2. `/postgresql/drop-tables` (GET):
   - Esta ruta elimina todas las tablas de la base de datos PostgreSQL, lo cual es útil para restablecer la base de datos a su estado original.
   - Responde con un mensaje de éxito o un mensaje de error en caso de problemas.

3. `/psql-to-mongo` (GET):
   - Esta ruta ejecuta un script que realiza una transferencia de datos desde PostgreSQL a MongoDB.
   - Responde con un mensaje de éxito o un mensaje de error en caso de problemas.
   - IMPORTANTE: El script ejecutado elimina todas la informacion previa en la base de datos de mongo.

4. `/postgresql/clients` (GET):
   - Esta ruta obtiene todos los registros de la tabla "e01_cliente" en PostgreSQL y los devuelve como una respuesta JSON.

5. `/postgresql/products` (GET):
   - Esta ruta obtiene todos los registros de la tabla "e01_producto" en PostgreSQL y los devuelve como una respuesta JSON.

6. `/postgresql/clients/insert` (POST):
   - Esta ruta permite insertar un nuevo cliente en la tabla "e01_cliente" de PostgreSQL. Los datos del cliente se envían en el cuerpo de la solicitud como JSON.

7. `/postgresql/clients/update` (POST):
   - Esta ruta permite actualizar un cliente existente en la tabla "e01_cliente" de PostgreSQL. Los datos actualizados se envían en el cuerpo de la solicitud como JSON.

8. `/postgresql/clients/delete` (POST):
   - Esta ruta permite eliminar un cliente de la tabla "e01_cliente" en PostgreSQL. El número de cliente se proporciona en el cuerpo de la solicitud.

9. `/postgresql/products/insert` (POST):
   - Esta ruta permite insertar un nuevo producto en la tabla "e01_producto" de PostgreSQL. Los datos del producto se envían en el cuerpo de la solicitud como JSON.

10. `/postgresql/products/update` (POST):
    - Esta ruta permite actualizar un producto existente en la tabla "e01_producto" de PostgreSQL. Los datos actualizados se envían en el cuerpo de la solicitud como JSON.

11. `/postgresql/products/delete` (POST):
    - Esta ruta permite eliminar un producto de la tabla "e01_producto" en PostgreSQL. El código del producto se proporciona en el cuerpo de la solicitud.

12. `/mongodb/clients` (GET):
    - Esta ruta obtiene todos los registros de la colección "e01_cliente" en MongoDB y los devuelve como una respuesta JSON.

13. `/mongodb/products` (GET):
    - Esta ruta obtiene todos los registros de la colección "e01_producto" en MongoDB y los devuelve como una respuesta JSON.

14. `/mongodb/clients/insert` (POST):
    - Esta ruta permite insertar un nuevo cliente en la colección "e01_cliente" de MongoDB. Los datos del cliente se envían en el cuerpo de la solicitud como JSON.

15. `/mongodb/clients/update` (POST):
    - Esta ruta permite actualizar un cliente existente en la colección "e01_cliente" de MongoDB. Los datos actualizados se envían en el cuerpo de la solicitud como JSON.

16. `/mongodb/clients/delete` (POST):
    - Esta ruta permite eliminar un cliente de la colección "e01_cliente" en MongoDB. El número de cliente se proporciona en el cuerpo de la solicitud.

17. `/mongodb/products/insert` (POST):
    - Esta ruta permite insertar un nuevo producto en la colección "e01_producto" de MongoDB. Los datos del producto se envían en el cuerpo de la solicitud como JSON.

18. `/mongodb/products/update` (POST):
    - Esta ruta permite actualizar un producto existente en la colección "e01_producto" de MongoDB. Los datos actualizados se envían en el cuerpo de la solicitud como JSON.

19. `/mongodb/products/delete` (POST):
    - Esta ruta permite eliminar un producto de la colección "e01_producto" en MongoDB. El código del producto se proporciona en el cuerpo de la solicitud.

20. La aplicación inicia un servidor en el puerto 3000 y escucha las solicitudes entrantes.

Cada ruta realiza operaciones específicas en la base de datos PostgreSQL y MongoDB según su nombre y el método HTTP utilizado (GET o POST). Las rutas GET recuperan datos, y las rutas POST insertan, actualizan o eliminan registros.

### Ejemplos de consultas

**Insertar un cliente en PostgreSQL:**

```sh
curl -X POST -H "Content-Type: application/json" -d '{
  "p_nro_cliente": 123000,
  "p_nombre": "Juan",
  "p_apellido": "Pérez",
  "p_direccion": "123 Calle Principal",
  "p_activo": 1 
}' http://localhost:3000/postgresql/clients/insert
```

**Actualizar un cliente en PostrgeSQL:**

```sh
curl -X POST -H "Content-Type: application/json" -d '{
  "p_nro_cliente": 123000,
  "p_nombre": "María",
  "p_apellido": "González",
  "p_direccion": "456 Calle Secundaria",
  "p_activo": 0
}' http://localhost:3000/postrgesql/clients/update
```

**Insertar un producto en MongoDB:**

```sh
curl -X POST -H "Content-Type: application/json" -d '{
  "p_codigo_producto": "P12345",
  "p_marca": "Marca A",
  "p_nombre": "Producto X",
  "p_descripcion": "Descripción del producto",
  "p_precio": 49.99,
  "p_stock": 100
}' http://localhost:3000/mongodb/products/insert
```
