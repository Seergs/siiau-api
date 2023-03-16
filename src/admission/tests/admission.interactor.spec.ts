import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AlertService } from 'src/alerts/alerts.service';
import { Admission } from '../entities/admission.entity';
import { AdmissionInteractor } from '../interactors/admission.interactor';

class MockAlertService {
    sendErrorAlert() {
        return Promise.resolve();
    }
}

class Cell {
    textContent: string

    constructor(textContent: string) {
        this.textContent = textContent;
    }

    evaluate(fn: (cell: Cell) => string) {
        return Promise.resolve(fn(this));
    }

    click() {
        return Promise.resolve();
    }
}

class FrameMock {
    constructor(private readonly frameName: string) { }
    name() {
        return this.frameName;
    }
    $x(selector: string) {
        if (selector === "/html/body/div[2]/div[2]/table/tbody/tr[3]/td[5]") {
            return null;
        }
        return Promise.resolve([new Cell("Ingeniería en Computación")]);
    }
    content() {
        return Promise.resolve('Escuela de procedencia');
    }
}

class FrameMockError {
    constructor(private readonly frameName: string) { }
    name() {
        return this.frameName;
    }
    $x(selector: string) {
        if (selector === "/html/body/div[2]/div[2]/table/tbody/tr[3]/td[5]") {
            return null;
        }
        return Promise.resolve([new Cell("Ingeniería en Computación")]);
    }
    content() {
        return Promise.resolve('Invalid frame content');
    }
}

class PageMockError {
    frames() {
        return [new FrameMockError("Contenido"), new FrameMock("Menu")];
    }
    waitForTimeout() {
        return Promise.resolve();
    }
    $x() {
        return Promise.resolve([new Cell("Ingeniería de Sistemas")]);
    }
}

class PageMock {
    frames() {
        return [new FrameMock("Contenido"), new FrameMock("Menu")];
    }
    waitForTimeout() {
        return Promise.resolve();
    }
    $x() {
        return Promise.resolve([new Cell("Ingeniería de Sistemas")]);
    }
}

class EmptyPage {
    frames() {
        return [];
    }
    waitForTimeout() {
        return Promise.resolve();
    }
}

describe('AdmissionInteractor', () => {
    let interactor: AdmissionInteractor;

    beforeEach(async () => {
        const AlertServiceProvider = {
            provide: AlertService,
            useClass: MockAlertService,
        };
        const module = await Test.createTestingModule({
            providers: [
                AlertServiceProvider,
                AdmissionInteractor
            ],
        }).compile();

        interactor = module.get<AdmissionInteractor>(AdmissionInteractor);
    });

    it('should be defined', () => {
        expect(interactor).toBeDefined();
    });

    describe('getAdmissionInformation', () => {
        it('should return a list of admissions', async () => {
            const result = await interactor.getAdmissionInformation(new PageMock() as any);
            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(1);
            expect((result[0] as Admission).career).toEqual(
                'Ingeniería en Computación',
            );
        });
    });

    describe('navigateToRequestedPage', () => {
        it("should fail it error while navigating to the page", async () => {
            const AlertServiceProvider = {
                provide: AlertService,
                useClass: MockAlertService,
            };
            const module = await Test.createTestingModule({
                providers: [
                    AlertServiceProvider,
                    AdmissionInteractor
                ],
            }).compile();

            interactor = module.get<AdmissionInteractor>(AdmissionInteractor);
            const alerts = module.get<AlertService>(AlertService);
            const alertSpy = jest.spyOn(alerts, "sendErrorAlert");
            await interactor.navigateToRequestedPage(new EmptyPage() as any);
            expect(alertSpy).toHaveBeenCalled();
        })

        it("should fail if validation is not passed on the requested page", async () => {
            const AlertServiceProvider = {
                provide: AlertService,
                useClass: MockAlertService,
            };
            const module = await Test.createTestingModule({
                providers: [
                    AlertServiceProvider,
                    AdmissionInteractor
                ],
            }).compile();

            interactor = module.get<AdmissionInteractor>(AdmissionInteractor);
            const alerts = module.get<AlertService>(AlertService);
            const alertSpy = jest.spyOn(alerts, "sendErrorAlert");
            await interactor.navigateToRequestedPage(new PageMockError() as any);
            expect(alertSpy).toHaveBeenCalled();
        })
    })
});
