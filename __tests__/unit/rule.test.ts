/* eslint-disable @typescript-eslint/no-unused-vars */
import { type DataCache, type RuleConfig, type RuleRequest, type RuleResult } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import {
  DatabaseManagerMock,
  determineOutcome,
  LoggerServiceMock,
  MockDatabaseManagerFactory,
  MockLoggerServiceFactory,
} from '@tazama-lf/frms-coe-lib/lib/tests/mocks';
import { handleTransaction, RuleExecutorConfig } from '../../src/rule';

const getRuleConfig = (): RuleConfig => {
  return {
    id: 'e2etest-amount@1.0.0',
    cfg: '1.0.0',
    desc: 'A large number of confusions - Me, myself, and I',
    config: {
      bands: [
        {
          reason: 'The amount is between 0 and 1999',
          lowerLimit: 0,
          subRuleRef: '.01',
          upperLimit: 1999,
        },
        {
          reason: 'The amount is between 2000 and 4999',
          lowerLimit: 2000,
          subRuleRef: '.02',
          upperLimit: 4999,
        },
        {
          reason: 'The amount is 5000 or more',
          lowerLimit: 5000,
          subRuleRef: '.03',
        },
      ],
      parameters: {},
      exitConditions: [],
    },
    tenantId: 'DEFAULT',
  };
};

const getMockRequest = (): RuleRequest => {
  const quote = {
    transaction: JSON.parse(
      `{"TxTp":"pain.001.001.11","TenantId":"tenantId","CstmrCdtTrfInitn":{"GrpHdr":{"MsgId":"17fa-afea-48d6-b147-05c8463ea494","CreDtTm":"2023-02-03T07:03:17.438Z","NbOfTxs":1,"InitgPty":{"Id":{"PrvtId":{"Othr":[{"Id":"+36-432226947","SchmeNm":{"Prtry":"MSISDN"}}],"DtAndPlcOfBirth":{"BirthDt":"1968-02-01","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"}}},"Nm":"April Blake Grant","CtctDtls":{"MobNb":"+36-432226947"}}},"PmtInf":{"Dbtr":{"Id":{"PrvtId":{"Othr":[{"Id":"+36-432226947","SchmeNm":{"Prtry":"typolog028"}}],"DtAndPlcOfBirth":{"BirthDt":"1968-02-01","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"}}},"Nm":"April Blake Grant","CtctDtls":{"MobNb":"+36-432226947"}},"PmtMtd":"TRA","DbtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"DbtrAcct":{"Id":{"Othr":[{"Id":"+36-432226947","SchmeNm":{"Prtry":"MSISDN"}}]},"Nm":"April Grant"},"PmtInfId":"23730c89dd57490a9a79f9b3747e3c08","ReqdAdvcTp":{"DbtAdvc":{"Cd":"ADWD","Prtry":"Advice with transaction details"}},"CdtTrfTxInf":{"Amt":{"EqvtAmt":{"Amt":{"Amt":1234,"Ccy":"USD"},"CcyOfTrf":"USD"},"InstdAmt":{"Amt":{"Amt":31020.89,"Ccy":"USD"}}},"Cdtr":{"Id":{"PrvtId":{"Othr":[{"Id":"+42-966969344","SchmeNm":{"Prtry":"MSISDN"}}],"DtAndPlcOfBirth":{"BirthDt":"1935-05-08","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"}}},"Nm":"Felicia Easton Quill","CtctDtls":{"MobNb":"+42-966969344"}},"Purp":{"Cd":"MP2P"},"PmtId":{"EndToEndId":"8f37-9e6f-4c30-bb87-5e0e42f0f000"},"ChrgBr":"DEBT","RmtInf":{"Ustrd":"Payment of USD 30713.75 from April to Felicia"},"CdtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}},"CdtrAcct":{"Id":{"Othr":[{"Id":"+42-966969344","SchmeNm":{"Prtry":"MSISDN"}}]},"Nm":"Felicia Quill"},"PmtTpInf":{"CtgyPurp":{"Prtry":"TRANSFER BLANK"}},"RgltryRptg":{"Dtls":{"Cd":"100","Tp":"BALANCE OF PAYMENTS"}},"SplmtryData":{"Envlp":{"Doc":{"Cdtr":{"FrstNm":"Felicia","LastNm":"Quill","MddlNm":"Easton","MrchntClssfctnCd":"BLANK"},"Dbtr":{"FrstNm":"April","LastNm":"Grant","MddlNm":"Blake","MrchntClssfctnCd":"BLANK"},"Xprtn":"2021-11-30T10:38:56.000Z","DbtrFinSvcsPrvdrFees":{"Amt":307.14,"Ccy":"USD"}}}}},"ReqdExctnDt":{"Dt":"2023-02-03","DtTm":"2023-02-03T07:03:17.438Z"}},"SplmtryData":{"Envlp":{"Doc":{"InitgPty":{"Glctn":{"Lat":"-3,1609","Long":"38,3588"},"InitrTp":"CONSUMER"}}}}}}`,
    ),
    networkMap: JSON.parse(
      '{"cfg":"1.0.0","name":"Public E2E Test Network Map","active":true,"messages":[{"id":"004@1.0.0","cfg":"1.0.0","txTp":"pacs.002.001.12","typologies":[{"id":"typology-processor@1.0.0","cfg":"999@1.0.0","rules":[{"id":"EFRuP@1.0.0","cfg":"none"},{"id":"901@1.0.0","cfg":"1.0.0"},{"id":"902@1.0.0","cfg":"1.0.0"},{"id":"028@1.0.0","cfg":"1.0.0"}],"tenantId":"cbe"},{"id":"typology-processor-r28-r91@1.0.0","cfg":"28-91@1.0.0","rules":[{"id":"028@1.0.0","cfg":"1.0.0"},{"id":"091@1.0.0","cfg":"1.0.0"}],"tenantId":"cbe"}]},{"id":"transferamount@1.0.0","cfg":"1.0.0","txTp":"transferamount","typologies":[{"id":"typology-processor-e2etest@1.0.0","cfg":"e2etest@1.0.0","rules":[{"id":"EFRuP@1.0.0","cfg":"none"},{"id":"e2etest-amount@1.0.0","cfg":"1.0.0"}],"tenantId":"cbe"}]}],"tenantId":"cbe"}',
    ),
    DataCache: JSON.parse(
      '{"cdtrId":"tenantId+42-966969344MSISDN","dbtrId":"+36-432226947typolog028","cdtrAcctId":"+42-966969344MSISDNdfsp002","intrBkSttlmAmt":{"ccy":"+36-432226947MSISDNtypolog028"}}',
    ),
  };
  return quote;
};

const getMockRequestUnsuccessful = (): RuleRequest => {
  const quote = getMockRequest();
  quote.transaction.FIToFIPmtSts.TxInfAndSts.TxSts = 'RJCT';
  return quote;
};

const ruleResult: RuleResult = {
  id: '021@1.0.0',
  cfg: '1.0.0',
  tenantId: 'DEFAULT',
  subRuleRef: '.err',
  reason: 'Unhandled rule result outcome',
};


const dataCache: DataCache = {
  dbtrId: 'dbtr_516c7065d75b4fcea6fffb52a9539357',
  cdtrId: 'cdtr_b086a1e193794192b32c8af8550d721d',
  dbtrAcctId: 'dbtrAcct_1fd08e408c184dd28cbaeef03bff1af5',
  cdtrAcctId: 'cdtrAcct_d531e1ba4ed84a248fe26617e79fcb64',
};

let databaseManager: DatabaseManagerMock<RuleExecutorConfig>;

let loggerService: LoggerServiceMock;
describe('Rule 021 Test', () => {
beforeEach(() => {
        loggerService = MockLoggerServiceFactory();
        loggerService.resetMock();
        databaseManager = MockDatabaseManagerFactory<RuleExecutorConfig>();
        databaseManager.resetMock();
  });
  describe('handleTransaction', () => {
    describe('Exit Conditions', () => {
let dataCache: DataCache;
        let req: RuleRequest;
beforeEach(() => {
        dataCache = {
            dbtrId: 'dbtr_516c7065d75b4fcea6fffb52a9539357',
            cdtrId: 'cdtr_b086a1e193794192b32c8af8550d721d',
            dbtrAcctId: 'dbtrAcct_1fd08e408c184dd28cbaeef03bff1af5',
            cdtrAcctId: 'cdtrAcct_d531e1ba4ed84a248fe26617e79fcb64',
        };
        req = getMockRequest();
      });
test('No RuleConfig - bands', async () => {
        const dbData = [1];
        databaseManager._eventHistory.query.mockResolvedValue({
          rows: [
            ...dbData.map((x) => ({
              Amt: x,
            })),
          ],
        });
        const rConfig = getRuleConfig();
        rConfig.config.bands = undefined;
        try {
          await handleTransaction(req, determineOutcome, ruleResult, loggerService, rConfig, databaseManager);
        } catch (error) {
          expect((error as Error).message).toBe('Invalid config provided - bands not provided');
        }
      });
test('No exit conditions', async () => {
        const dbData = [1, 2, 3];
        databaseManager._eventHistory.query.mockResolvedValue({
          rows: [
            ...dbData.map((x) => ({
              Amt: x,
            })),
          ],
        });
        try {
          const rConfig = getRuleConfig();
          rConfig.config.exitConditions = undefined;
          await handleTransaction(req, determineOutcome, ruleResult, loggerService, rConfig, databaseManager);
        } catch (error) {
          expect((error as Error).message).toBe('Invalid config provided - exitConditions not provided');
        }
      });
test('No tolerance', async () => {
        // Mocking the request of getting oldes transation timestamp
        const dbData = [1, 2, 3];
        databaseManager._eventHistory.query.mockResolvedValue({
          rows: [
            ...dbData.map((x) => ({
              Amt: x,
            })),
          ],
        });
        try {
          const rConfig = getRuleConfig();
          rConfig.config.parameters!.tolerance = undefined;
          await handleTransaction(req, determineOutcome, ruleResult, loggerService, rConfig, databaseManager);
        } catch (error) {
          expect((error as Error).message).toBe('Invalid config provided - tolerance parameter not provided or invalid type');
        }
      });
test('No tolerance - not number', async () => {
        const dbData = [1, 2, 3];
        databaseManager._eventHistory.query.mockResolvedValue({
          rows: [
            ...dbData.map((x) => ({
              Amt: x,
            })),
          ],
        });
        try {
          const rConfig = getRuleConfig();
          rConfig.config.parameters!.tolerance = 'zero point two';
          await handleTransaction(req, determineOutcome, ruleResult, loggerService, rConfig, databaseManager);
        } catch (error) {
          expect((error as Error).message).toBe('Invalid config provided - tolerance parameter not provided or invalid type');
        }
      });
    });
  });
});