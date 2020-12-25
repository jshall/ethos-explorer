import { IDomain } from 'ethos';

export const Ethos: Promise<IDomain>
    = import(/* webpackChunkName: 'ethos' */ '../../ethos')
        .then((ethos: any) => ethos.default);