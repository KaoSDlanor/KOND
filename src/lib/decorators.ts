export const Debounce = (Delay: number) => {
  let TimeLastRun: number = 0;
  let TimeoutID: ReturnType<typeof setTimeout>
  return (target: any,propertyKey: string,descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
      clearTimeout(TimeoutID);
      TimeoutID = setTimeout(() => {
        TimeLastRun = +new Date();
        return originalMethod.apply(this,args);
      },Math.max(0,Delay - +new Date() + TimeLastRun));
    }
  }
};