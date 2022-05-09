export interface IEvent {
    version: string;
    id: string;
    "detail-type": string;
    source: string;
    account: string;
    time: Date;
    region: string;
    resources: Array<any>;
    detail: any;
}
