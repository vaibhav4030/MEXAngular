import {bootstrap}    from '@angular/platform-browser-dynamic'; 
import { provide } from '@angular/core';
import { FORM_PROVIDERS } from '@angular/common';

import { ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { Http , HTTP_PROVIDERS} from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AuthConfig, AuthHttp } from 'angular2-jwt';

import {AppComponent} from './app.component';

bootstrap(AppComponent, 
        [
            FORM_PROVIDERS, 
            ROUTER_PROVIDERS,
            HTTP_PROVIDERS,
            provide (LocationStrategy, {useClass: HashLocationStrategy}),
            provide(AuthHttp, {
                useFactory: (http:any) => {
                    return new AuthHttp(new AuthConfig({
                    tokenName: 'jwt'
                    }), http);
                },
                deps: [Http]
            })
        ] 
);
