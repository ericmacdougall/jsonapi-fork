import { OperatorDesc, FinalizedOperatorDesc, ParserOperatorsConfig } from '../../types';
export declare const ASSUMED_BINARY_OPERATORS: string[];
export declare function finalizeOperatorConfig(assumedBinaryOps: string[], operatorName: string, operatorConfig: OperatorDesc): FinalizedOperatorDesc;
declare const _default: (x1: string, x2: OperatorDesc) => Required<OperatorDesc>;
export default _default;
export declare function finalizeFilterFieldExprArgs(conf: ParserOperatorsConfig, operator: string, args: any[]): any[];
