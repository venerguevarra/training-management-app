export class Registration {
  constructor(
    public firstName: string = "",
    public lastName: string = "",
    public middleInitial: string = null,
    public email: string = null,
    public designation: string = "",
    public mobileNumber: string = ""
  ) {}
}
