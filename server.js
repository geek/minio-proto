'use strict';

const Brule = require('brule');
//const Crumb = require('crumb');
const Hapi = require('hapi');
const Inert = require('inert');
const Api = require('minio-proto-api');
const Sso = require('minio-proto-auth');
const UI = require('minio-proto-ui');
const Rollover = require('rollover');

async function main () {
  const server = Hapi.server({ port: process.env.PORT || 80, host: '127.0.0.1' });

  await server.register([
    Inert,
/*    {
      plugin: Crumb,
      options: {
        restful: true,
        cookieOptions: {
          isSecure: false,
          domain: process.env.COOKIE_DOMAIN,
          isHttpOnly: false,
          ttl: 1000 * 60 * 60       // 1 hour
        }
      }
    },
*/
    {
      plugin: Sso,
      options: {
        cookie: {
          password: process.env.COOKIE_PASSWORD,
          domain: process.env.COOKIE_DOMAIN,
          isSecure: true,
          isHttpOnly: true,
          ttl: 1000 * 60 * 60       // 1 hour
        },
        sso: {
          keyPath: process.env.SDC_KEY_PATH,
          keyId: '/' + process.env.SDC_ACCOUNT + '/keys/' + process.env.SDC_KEY_ID,
          apiBaseUrl: process.env.SDC_URL,
          url: 'https://sso.joyent.com/login',
          permissions: { 'cloudapi': ['/my/*'] },
          baseUrl: process.env.BASE_URL
        }
      }
    },
    {
      plugin: Rollover,
      options: {
        rollbar: {
          accessToken: process.env.ROLLBAR_SERVER_TOKEN,
          reportLevel: 'error'
        }
      }
    },
    {
      plugin: UI,
      options: {}
    },
    {
      plugin: Api,
      options: {
        accounts: process.env.ALLOWED_ACCOUNTS,
        admins: process.env.ADMIN_ACCOUNTS,
        authStrategy: 'sso',
        graphiAuthStrategy: 'sso',
        db: {
          user: process.env.MYSQL_USER,
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DATABASE,
          host: process.env.MYSQL_HOST
        },
        cloudflare: {
          zoneId: process.env.CF_ZONEID,
          email: process.env.CF_EMAIL,
          key: process.env.CF_KEY,
          arecordParent: process.env.ARECORD_PARENT
        }
      }
    },
    {
      plugin: Brule,
      options: {
        auth: false
      }
    }
  ]);

  server.auth.default('sso');

  await server.start();
  server.log(['info'], `server started at http://0.0.0.0:${server.info.port}`);

  process.on('unhandledRejection', (err) => {
    server.log(['error'], err);
  });
}

main();
