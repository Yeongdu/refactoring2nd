export default function createStatementData(invoice, plays) {
  const result = {};
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return result;

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0); // for 반복문을 파이프라인으로 바꿈
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0); // for 반복문을 파이프라인으로 바꿈
  }

  function enrichPerformance(aPerformance) {
    const calculator = new PerfomanceCalculator(
      aPerformance,
      playFor(aPerformance)
    ); // 공연료 계산기 생성 // 공연정보를 계산기로 전달
    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function amountFor(aPerformance) {
    return new PerfomanceCalculator(aPerformance, playFor(aPerformance)).amount;
  }

  function volumeCreditsFor(aPerformance) {
    return new PerfomanceCalculator(aPerformance, playFor(aPerformance))
      .volumeCredits;
  }
}

class PerfomanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performances = aPerformance;
    this.play = aPlay;
  }

  get amount() {
    let result = 0;
    switch (this.play.type) {
      case 'tragedy': //비극
        result = 40000;
        if (this.performances.audience > 30) {
          result += 1000 * (this.performances.audience - 30);
        }
        break;
      case 'comedy': //희극
        result = 30000;
        if (this.performances.audience > 20) {
          result += 10000 + 500 * (this.performances.audience - 20);
        }
        result += 300 * this.performances.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${this.play.type}`);
    }
    return result;
  }

  get volumeCredits() {
    let result = 0;
    result += Math.max(this.performances.audience - 30, 0);
    if ('comedy' === this.play.type)
      result += Math.floor(this.performances.audience / 5);
    return result;
  }
}
