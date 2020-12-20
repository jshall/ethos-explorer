import SwaggerUI from 'swagger-ui'
import 'swagger-ui/dist/swagger-ui.css';
import * as ethos from "./ethos";

import spec from './swagger-config.yaml';

const ui = SwaggerUI({
  spec,
  dom_id: '#swagger',
});

ui.initOAuth({
  appName: "Swagger UI Webpack Demo",
  // See https://demo.identityserver.io/ for configuration details.
  clientId: 'implicit'
});

window.ethos = ethos;
