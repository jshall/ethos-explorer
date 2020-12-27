import { IDomain, IResourceList as IResourceDictionary } from 'ethos';
import { Import } from './Import';

export interface IEthosData {
    sources: string[]
    domains: IDomain[]
    resources: IResourceDictionary
}

export const EthosData: Promise<IEthosData>
    = import(/* webpackChunkName: 'ethos' */ 'ethos')
        .then((ethos: Import<IEthosData>) => ethos.default);