import { Test } from "@nestjs/testing";
import { AdmissionService } from "../admission.service"

class ApiServiceMock {
  getAdmissionInformation(_: string, __: string, ___: string) {
    return []
  }
}

describe.only("AdmissionService", () => {
  let admissionService: AdmissionService;

  beforeAll(async() => {
    const ApiServiceProvider = {
      provide: AdmissionService,
      useClass: ApiServiceMock
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
	AdmissionService, ApiServiceProvider
      ]
    }).compile();

    admissionService = moduleRef.get<AdmissionService>(AdmissionService);
  })

  it("should call getAdmissionInfo with expected params", async() => {
    const getAdmissionInfoSpy = jest.spyOn(admissionService, 'getAdmissionInformation');
    const studentCode = "mycode";
    const studentNip = "mynip";
    const url = "admission"
    admissionService.getAdmissionInformation(studentCode, studentNip, url);
    expect(getAdmissionInfoSpy).toHaveBeenCalledWith(studentCode, studentNip, url)
  })
})
