export interface MethodMetrics{
    methodName:String,
    cyclomaticComplexity:Number,
    nestingDepth:Number,
    functionSize:Number
}

export interface ClassMetrics{
    className:String,
    methods:MethodMetrics[]

}
export interface FileMetrics{
    fileName:String,
    classes:ClassMetrics[]
}
