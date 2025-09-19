// src/core/TonalpoualiCore.ts (v14.2-audit - Corrección UTC con Depuración)

export interface TonalpoualiQueryResult {
  gregorianDate: string;
  tonalpoualiIndex: number;
  dayNumeral: number;
  dayTonal: string;
  isNemontemi: boolean;
  xiuhpoualliYear: string;
  xiuhpoualliDay: number;

  //nemontemiTonalIndex: number | null;
  //nemontemiDayNumeral: number | null;
  //nemontemiDayTonal: string | null;
}

const TONALLI_NAMES = [
  'Sipaktli',  'Ejekatl',   'Kali',      'Kuetspalin', 'Koatl',
  'Mikistli',  'Masatl',    'Tochtli',   'Atl',        'Itskuintli',
  'Osomatli',  'Malinali',  'Akatl',     'YoualMixtli',    'Kuautli',
  'Koskakuautli','Olin',    'Tekpatl',   'Kiauitl',    'Xochitl'
];

const BEARER_NAMES = ['Kali', 'Tochtli', 'Akatl', 'Tekpatl'];

export class TonalpoualiCore {
  private readonly REF_YEAR_GREGORIAN = 2025;
  private readonly REF_YEAR_NUMERAL = 13;
  private readonly REF_YEAR_BEARER_INDEX = 0; // Kali
  private readonly REF_YEAR_START_GREGORIAN = new Date(Date.UTC(2025, 2, 15));
  private readonly REF_YEAR_START_TONAL_NUMERAL = 5;

  private readonly GREGORIAN_REFORM_DATE = new Date(1582, 9, 4);
  private readonly HISTORICAL_OFFSET_DAYS = 13;

  private readonly BEARER_START_TIMES = [
    { hour: 0, minute: 45 },  // Kali
    { hour: 6, minute: 45 },  // Tochtli
    { hour: 12, minute: 45 }, // Akatl
    { hour: 18, minute: 45 }  // Tekpatl
  ];

  private isGregorianLeap(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  private getSipaktliIndex(numeral: number): number {
    const numeralIndex = numeral - 1;
    for (let i = 0; i < 13; i++) {
        const index = i * 20;
        if (index % 13 === numeralIndex) return index;
    }
    return 160;
  }

  private findAnchorYear(targetDate: Date) {
      let yearData = {
          gregorianYear: this.REF_YEAR_GREGORIAN,
          startDate: this.REF_YEAR_START_GREGORIAN,
          yearNumeral: this.REF_YEAR_NUMERAL,
          bearerIndex: this.REF_YEAR_BEARER_INDEX,
          startTonalNumeral: this.REF_YEAR_START_TONAL_NUMERAL,
      };
      
      const targetTime = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

      // La lógica de simulación permanece igual, ya que es correcta.
      if (targetTime < yearData.startDate.getTime()) {
          while (targetTime < yearData.startDate.getTime()) {
              yearData.gregorianYear--;
              const prevYearLength = this.isGregorianLeap(yearData.gregorianYear) ? 366 : 365;
              let newStartDate = new Date(yearData.startDate);
              newStartDate.setUTCDate(newStartDate.getUTCDate() - prevYearLength);
              yearData.startDate = newStartDate;

              yearData.yearNumeral = (yearData.yearNumeral - 2 + 13) % 13 + 1;
              yearData.bearerIndex = (yearData.bearerIndex - 1 + 4) % 4;
              const prevStartTonalNumeralIndex = ((yearData.startTonalNumeral - 1) - 9 + 13 * 2) % 13;
              yearData.startTonalNumeral = prevStartTonalNumeralIndex + 1;
          }
      } else {
          while (true) {
              const currentYearLength = this.isGregorianLeap(yearData.gregorianYear) ? 366 : 365;
              let nextStartDate = new Date(yearData.startDate);
              nextStartDate.setUTCDate(nextStartDate.getUTCDate() + currentYearLength);
              
              if (targetTime < nextStartDate.getTime()) break;
              
              yearData.startDate = nextStartDate;
              yearData.gregorianYear++;
              yearData.yearNumeral = (yearData.yearNumeral % 13) + 1;
              yearData.bearerIndex = (yearData.bearerIndex + 1) % 4;
              const nextStartTonalNumeralIndex = ((yearData.startTonalNumeral - 1) + 9) % 13;
              yearData.startTonalNumeral = nextStartTonalNumeralIndex + 1;
          }
      }
      
      // DEVOLVEMOS UN OBJETO SIMPLE Y PURO
      return {
          year: yearData.gregorianYear,
          yearNumeral: yearData.yearNumeral,
          bearerIndex: yearData.bearerIndex,
          startTonalNumeral: yearData.startTonalNumeral,
          // Componentes puros de la fecha de inicio UTC
          startY: yearData.startDate.getUTCFullYear(),
          startM: yearData.startDate.getUTCMonth(),
          startD: yearData.startDate.getUTCDate(),
      };
  }

public calculate(gregorianDate: Date): TonalpoualiQueryResult {
      console.clear();
      console.log(`%c--- [AUDITORÍA v15.0] ---`, "color: yellow; font-weight: bold;");
      console.log(`[1] ENTRADA:`, gregorianDate.toString());

      const yearData = this.findAnchorYear(gregorianDate);
      const yearStr = `${yearData.yearNumeral} ${BEARER_NAMES[yearData.bearerIndex]}`;
      console.log(`[2] AÑO ENCONTRADO: ${yearStr} (Inicia ${yearData.startD}/${yearData.startM + 1}/${yearData.startY})`);

      const rolloverTime = this.BEARER_START_TIMES[yearData.bearerIndex];
      let targetDay = new Date(gregorianDate);
      let decision = "después del cambio";
      if (gregorianDate.getHours() < rolloverTime.hour || (gregorianDate.getHours() === rolloverTime.hour && gregorianDate.getMinutes() < rolloverTime.minute)) {
          targetDay.setDate(targetDay.getDate() - 1);
          decision = "antes del cambio";
      }
      console.log(`[3] DECISIÓN HORARIA: La hora local (${gregorianDate.getHours()}:${gregorianDate.getMinutes()}) es ${decision}. Se usará la fecha ${targetDay.toLocaleDateString('es-MX')}`);

      // Usamos los componentes puros devueltos por findAnchorYear
      const startDateUTC = Date.UTC(yearData.startY, yearData.startM, yearData.startD);
      const targetDayUTC = Date.UTC(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate());
      console.log(`[4] TIMESTAMPS UTC PARA CÁLCULO:\n · Inicio: ${startDateUTC}\n · Objetivo: ${targetDayUTC}`);
      
      const diffMillis = targetDayUTC - startDateUTC;
      let dayOfYear = Math.floor(diffMillis / 86400000);
      console.log(`[5] CÁLCULO DE DÍAS:\n · Diff Millis: ${diffMillis}\n · Días Transcurridos: ${dayOfYear}`);

      if (targetDay < this.GREGORIAN_REFORM_DATE) {
          dayOfYear += this.HISTORICAL_OFFSET_DAYS;
      }
      
      if (dayOfYear >= 360) {
          return { gregorianDate: gregorianDate.toISOString(), isNemontemi: true, tonalpoualiIndex: -1, dayNumeral: -1, dayTonal: 'Nemontemi', xiuhpoualliYear: yearStr, xiuhpoualliDay: dayOfYear + 1 };
      }
      
      const startTonalIndex = this.getSipaktliIndex(yearData.startTonalNumeral);
      const currentTonalIndex = (startTonalIndex + dayOfYear) % 260;
      console.log(`[6] CÁLCULO TONAL:\n · Índice de Inicio (${yearData.startTonalNumeral} Sipaktli): ${startTonalIndex}\n · Índice Final: (${startTonalIndex} + ${dayOfYear}) % 260 = ${currentTonalIndex}`);
      
      const dayNumeral = (currentTonalIndex % 13) + 1;
      const dayTonal = TONALLI_NAMES[currentTonalIndex % 20];
      console.log(`%c[7] RESULTADO: ${dayNumeral} ${dayTonal}`, "color: lightgreen; font-weight: bold;");
      
      return {
          gregorianDate: gregorianDate.toISOString(),
          tonalpoualiIndex: currentTonalIndex,
          dayNumeral: dayNumeral, dayTonal: dayTonal,
          isNemontemi: false, xiuhpoualliYear: yearStr,
          xiuhpoualliDay: dayOfYear + 1,
      };
  }
}
