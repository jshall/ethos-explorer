import { IDomain, IResourceList } from 'ethos';
import { Import } from './Import';

export interface IEthosData {
    structure: IDomain
    resources: IResourceList
}

export const EthosData: Promise<IEthosData>
    = import(/* webpackChunkName: 'ethos' */ 'ethos')
        .then((ethos: Import<IEthosData>) => ethos.default);