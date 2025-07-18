import {
    NativeModules,
    NativeEventEmitter,
    EventSubscription
} from 'react-native';

import { NativeObject } from './NativeObject';
import { StarConnectionSettings } from './StarConnectionSettings';
import { StarPrinterInformation } from './StarPrinterInformation';
import { StarIO10ErrorFactory } from './StarIO10ErrorFactory';
import { StarPrinterStatus } from './StarPrinterStatus';
import { StarPrinterStatusFactory } from './StarPrinterStatusFactory';
import { PrinterDelegate } from './PrinterDelegate';
import { DrawerDelegate } from './DrawerDelegate';
import { InputDeviceDelegate } from './InputDeviceDelegate';
import { DisplayDelegate } from './DisplayDelegate';
import { StarSpoolJobSettings } from './StarSpoolJobSettings';
import { StarSpoolJobStatus } from './StarSpoolJobStatus';
import { StarSpoolJobStatusFactory } from './StarSpoolJobStatusFactory';
import { StarSpoolJobStatusListFactory } from './StarSpoolJobStatusListFactory';
import { StarConfigurationSetResult } from './StarConfigurationSetResult';
import { StarIO10ErrorDetail } from './StarIO10ErrorDetail';
import { StarIO10ErrorDetailFactory } from './StarIO10ErrorDetailFactory';
import { StarPrinterSetting } from './StarPrinterSetting';
import { StarPrinterSettingFactory } from './StarPrinterSettingFactory';

const eventEmitter = new NativeEventEmitter(NativeModules.StarPrinterWrapper);

export class StarPrinter extends NativeObject {
    private _eventSubscriptions: Array<EventSubscription> = [];
    private _connectionSettings: StarConnectionSettings;
    private _printerDelegate: PrinterDelegate  = new PrinterDelegate();
    private _drawerDelegate: DrawerDelegate  = new DrawerDelegate();
    private _inputDeviceDelegate: InputDeviceDelegate  = new InputDeviceDelegate();
    private _displayDelegate: DisplayDelegate  = new DisplayDelegate();

    _information: StarPrinterInformation | undefined = undefined;

    openTimeout: number = 10000;
    printTimeout: number = 30000;
    getStatusTimeout: number = 5000;
    starConfigurationTimeout: number = 90000;

    template: string | undefined = undefined;

    _setting: StarPrinterSetting | undefined = undefined;

    get information(): StarPrinterInformation | undefined {
        return this._information;
    }

    get connectionSettings(): StarConnectionSettings {
        return this._connectionSettings;
    }

    get setting(): StarPrinterSetting | undefined {
        return this._setting;
    }

    get printerDelegate(): PrinterDelegate {
        return this._printerDelegate;
    }

    get drawerDelegate(): DrawerDelegate {
        return this._drawerDelegate;
    }

    get inputDeviceDelegate(): InputDeviceDelegate {
        return this._inputDeviceDelegate;
    }

    get displayDelegate(): DisplayDelegate {
        return this._displayDelegate;
    }

    constructor(connectionSettings : StarConnectionSettings) {
        super();

        this._connectionSettings = connectionSettings;

        this.printerDelegate._onEventSet = async () => {
            this.printerDelegate._onEventSet = () => {};

            await this._initNativeObject();

            await NativeModules.StarPrinterWrapper.activatePrinterDelegate(this._nativeObject);
        };

        this.drawerDelegate._onEventSet = async () => {
            this.drawerDelegate._onEventSet = () => {};

            await this._initNativeObject();

            await NativeModules.StarPrinterWrapper.activateDrawerDelegate(this._nativeObject);
        };

        this.inputDeviceDelegate._onEventSet = async () => {
            this.inputDeviceDelegate._onEventSet = () => {};

            await this._initNativeObject();

            await NativeModules.StarPrinterWrapper.activateInputDeviceDelegate(this._nativeObject);
        };

        this.displayDelegate._onEventSet = async () => {
            this.displayDelegate._onEventSet = () => {};

            await this._initNativeObject();

            await NativeModules.StarPrinterWrapper.activateDisplayDelegate(this._nativeObject);
        };

        this._eventSubscriptions.push(
            eventEmitter.addListener('PrinterCommunicationError', async (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    var error = await StarIO10ErrorFactory.create(actualPrams.errorIdentifier);
                    this.printerDelegate.onCommunicationError(error);
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('PrinterReady', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.printerDelegate.onReady();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('PrinterError', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.printerDelegate.onError();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('PrinterPaperReady', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.printerDelegate.onPaperReady();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('PrinterPaperNearEmpty', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.printerDelegate.onPaperNearEmpty();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('PrinterPaperEmpty', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.printerDelegate.onPaperEmpty();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('PrinterCoverOpened', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.printerDelegate.onCoverOpened();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('PrinterCoverClosed', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.printerDelegate.onCoverClosed();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('DrawerCommunicationError', async (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    var error = await StarIO10ErrorFactory.create(actualPrams.errorIdentifier);
                    this.drawerDelegate.onCommunicationError(error);
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('DrawerOpenCloseSignalSwitched', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.drawerDelegate.onOpenCloseSignalSwitched(actualPrams.openCloseSignal);
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('InputDeviceCommunicationError', async (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    var error = await StarIO10ErrorFactory.create(actualPrams.errorIdentifier);
                    this.inputDeviceDelegate.onCommunicationError(error);
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('InputDeviceConnected', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.inputDeviceDelegate.onConnected();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('InputDeviceDisconnected', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.inputDeviceDelegate.onDisconnected();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('InputDeviceDataReceived', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.inputDeviceDelegate.onDataReceived(actualPrams.data);
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('DisplayCommunicationError', async (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    var error = await StarIO10ErrorFactory.create(actualPrams.errorIdentifier);
                    this.displayDelegate.onCommunicationError(error);
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('DisplayConnected', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.displayDelegate.onConnected();
                }
            }, this)
        );
        this._eventSubscriptions.push(
            eventEmitter.addListener('DisplayDisconnected', (params: any) => {
                var actualPrams = NativeObject._getEventParams(params);
                if(this._nativeObject === actualPrams.identifier) {
                    this.displayDelegate.onDisconnected();
                }
            }, this)
        );
    }

    async open(): Promise<void> {
        await this._initNativeObject();

        await NativeModules.StarPrinterWrapper.open(this._nativeObject, this.connectionSettings.interfaceType, this.connectionSettings.identifier, this.openTimeout, this.connectionSettings.autoSwitchInterface)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });

        this._information = new StarPrinterInformation();
        this._information._model = await NativeModules.StarPrinterWrapper.getModel(this._nativeObject);
        this._information._emulation = await NativeModules.StarPrinterWrapper.getEmulation(this._nativeObject);
        this._information._reserved = new Map(Object.entries(await NativeModules.StarPrinterWrapper.getReserved(this._nativeObject)));

        var nativeSetting = await NativeModules.StarPrinterSettingWrapper.init(this._nativeObject)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });

        this._setting = await StarPrinterSettingFactory.create(nativeSetting, this._nativeObject);
    }

    async print(command: string): Promise<void>;
    async print(command: string, starSpoolJobSettings: StarSpoolJobSettings): Promise<number>;

    async print(
        ...args:
          | [command: string]
          | [command: string, starSpoolJobSettings: StarSpoolJobSettings]
      ): Promise<void | number> {
        await this._initNativeObject();

        if (args.length === 1) {
            const [command] = args;

            await NativeModules.StarPrinterWrapper.print(this._nativeObject, command, this.template, this.printTimeout)
            .catch(async (nativeError: any) => {
                var error = await StarIO10ErrorFactory.create(nativeError.code);
                throw error;
            });
        }
        if (args.length === 2) {
            const [command, starSpoolJobSettings] = args;

            var jobId = await NativeModules.StarPrinterWrapper.spoolPrint(this._nativeObject, command, this.template, starSpoolJobSettings.isRetryEnabled, starSpoolJobSettings.timeout, starSpoolJobSettings.note, this.printTimeout)
            .catch(async (nativeError: any) => {
                var error = await StarIO10ErrorFactory.create(nativeError.code);
                throw error;
            });

            return jobId;
        }
    }

    async printRawData(data: Array<number>): Promise<void> {
        await this._initNativeObject();

        await NativeModules.StarPrinterWrapper.printRawData(this._nativeObject, data, this.printTimeout)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });
    }

    async getStatus(): Promise<StarPrinterStatus> {
        await this._initNativeObject();

        var nativeStatus = await NativeModules.StarPrinterWrapper.getStatus(this._nativeObject, this.getStatusTimeout)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });

        return await StarPrinterStatusFactory.create(nativeStatus);
    }

    async getSpoolJobStatus(jobId: number): Promise<StarSpoolJobStatus> {
        await this._initNativeObject();

        var nativeStatus = await NativeModules.StarPrinterWrapper.getSpoolJobStatus(this._nativeObject, jobId, this.getStatusTimeout)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });

        return await StarSpoolJobStatusFactory.create(nativeStatus);
    }

    async getSpoolJobStatusList(size: number): Promise<Array<StarSpoolJobStatus>> {
        await this._initNativeObject();

        var nativeStatusList = await NativeModules.StarPrinterWrapper.getSpoolJobStatusList(this._nativeObject, size, this.getStatusTimeout)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });

        return await StarSpoolJobStatusListFactory.create(nativeStatusList);
    }

    async setStarConfiguration(starConfiguration: string): Promise<StarConfigurationSetResult> {
        await this._initNativeObject();

        var starConfigurationSetResult = await NativeModules.StarPrinterWrapper.setStarConfiguration(this._nativeObject, starConfiguration, this.starConfigurationTimeout)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });

        return starConfigurationSetResult;
    }

    async getStarConfiguration(password: string | undefined = undefined): Promise<string> {
        await this._initNativeObject();

        var starConfiguration = await NativeModules.StarPrinterWrapper.getStarConfiguration(this._nativeObject, password, this.starConfigurationTimeout)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });

        return starConfiguration;
    }

    async getDefaultStarConfiguration(): Promise<string> {
        await this._initNativeObject();

        var starConfiguration = await NativeModules.StarPrinterWrapper.getDefaultStarConfiguration(this._nativeObject, this.starConfigurationTimeout)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });

        return starConfiguration;
    }

    async close(): Promise<void> {
        await this._initNativeObject();

        await NativeModules.StarPrinterWrapper.close(this._nativeObject)
        .catch(async (nativeError: any) => {
            var error = await StarIO10ErrorFactory.create(nativeError.code);
            throw error;
        });
    }

    get errorDetail(): Promise<StarIO10ErrorDetail> {
        return (async () => {
                await this._initNativeObject();

                var nativeErrorDetail = await NativeModules.StarPrinterWrapper.getErrorDetail(this._nativeObject)
                .catch(async (nativeError: any) => {
                    var error = await StarIO10ErrorFactory.create(nativeError.code);
                    throw error;
                });
                
                return await StarIO10ErrorDetailFactory.create(nativeErrorDetail);
        })();
    }

    async dispose(): Promise<void> {
        await this._initNativeObject();

        await this._setting?.dispose();
        this._setting = undefined;

        await this.close();

        await this._disposeNativeObject();

        for(let eventSubscription of this._eventSubscriptions) {
            eventSubscription.remove();
        }
        this._eventSubscriptions = [];
    }

    protected async _initNativeObjectImpl(): Promise<string> {
        return await NativeModules.StarPrinterWrapper.init();
    }

    protected async _disposeNativeObjectImpl(nativeObject: string): Promise<void> {
        await NativeModules.StarPrinterWrapper.dispose(nativeObject);
    }
}