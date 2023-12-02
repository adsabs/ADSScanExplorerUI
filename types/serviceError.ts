export enum ServiceErrors{
    search_error = 1,
    unkown_error,
}

class ServiceError extends Error {
    type: ServiceErrors
    status: number
    info: Response

    constructor(msg: string, type: ServiceErrors = ServiceErrors.unkown_error) {
        super(msg);
        this.type = type;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ServiceError.prototype);
    }

    getMessage() {
        switch(this.type) {
            case ServiceErrors.search_error:
                return "Sorry! " + this.message + ". Try looking at the search examples on the home page or reading our help page.";
            default:
                return this.message
        }
    }


}


export default ServiceError