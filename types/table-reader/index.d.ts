export class SelectQuery {
    from (contractName: string): FromQuery;
}

export class FromQuery {
    equal (value: any): EqualQuery;
    limit (limit: number): LimitQuery;
    scope (accountName: string): ScopeQuery;
    range (minValue: any, maxValue: any): RangeQuery;
    index (index: number, keyType?: string): IndexQuery;

    find (): Promise<Array<any>>;
}

export class ScopeQuery {
    equal (value: any): EqualQuery;
    limit (limit: number): LimitQuery;
    range (minValue: any, maxValue: any): RangeQuery;
    index (index: number, keyType?: string): IndexQuery;

    find (): Promise<Array<any>>;
}

export class EqualQuery {
    limit (limit: number): LimitQuery;
    index (index: number, keyType: string): IndexQuery;

    find (): Promise<Array<any>>;
}

export class RangeQuery {
    limit (limit: number): LimitQuery;
    index (index: number, keyType: string): IndexQuery;

    find (): Promise<Array<any>>;
}

export class LimitQuery {
    equal (value: any): EqualQuery;
    range (minValue: any, maxValue: any): RangeQuery;
    index (index: number, keyType: string): IndexQuery;

    find (): Promise<Array<any>>;
}

export class IndexQuery {
    equal (value: any): EqualQuery;
    limit (limit: number): LimitQuery;
    range (minValue: any, maxValue: any): RangeQuery;

    find (): Promise<Array<any>>;
}

