const calculator = document.querySelector('.calc');
const calcClearBlock = document.getElementById('calc-clear');
let clearAllPushCount = 0;
let history = [];
let allHistory = []
let tempNumber = '';
let operationType = '';
let isPercent = false;
let isEqual = false;


calculator.addEventListener('click', (event) => {
	const target = event.target;
	if(target.classList.contains('calc__col')) {
		const data = target.dataset.type;
		const totalBlock = calculator.querySelector('.calc__total');
		const historyBlock = calculator.querySelector('.calc__history');

		operationTypeHandling(data);
		// console.log(tempNumber);
		totalBlock.innerHTML = tempNumber;
		historyBlock.innerHTML = renderHistory( history);
		historyPanelRender(allHistory)
	}
})

// Работа в операциями в калькуляторе
function operationTypeHandling(data) {
	if(data !== 'clear' && data !== 'history') {
		calcClearBlock.innerText = 'C'
	}
	if(data >= 0) {
		operationType = 'number';
		tempNumber = tempNumber === '0' ? data : tempNumber + data;
	} else if(data === 'float'){
		operationType = 'number';
		if(!/\./.test(tempNumber)) {
			if(tempNumber) {
				tempNumber = tempNumber + '.';
			} else {
				tempNumber = '0.'
			}
		}
	} else if (data === 'delete' && operationType === 'number') {
		tempNumber = tempNumber.substring(0, tempNumber.length-1);
		tempNumber = tempNumber ? tempNumber : '0';
		isPercent = false;
	} else if(['+', '-', '/', '*'].includes(data) && tempNumber) {
		operationType = data;
		history.push(tempNumber, operationType);
		tempNumber = '';
		isPercent = false;
	} else if(data === 'clear') {
		history = [];
		tempNumber = '0'
		isPercent = false;
		if(calcClearBlock.innerText === 'C') {
			calcClearBlock.innerHTML = 'AC'
		} else {
			calcClearBlock.innerHTML = 'AC';
			allHistory = [];
		}
	} else if( data === 'history') {
		openHistoryPanel()
	} else if( data === '%') {
		history.push(tempNumber);
		isPercent = true;
		isEqual = false;
		if(history.length === 1) {
			tempNumber= tempNumber / 100;
		} else {
			tempNumber = getResult(history, isPercent, isEqual);
		}
		
		
	} else if( data === '=') {
		const historySegment = [];
		
		if(!isPercent) {
			history.push(tempNumber);
		}
		historySegment.push(history);
		isEqual = true;
		tempNumber = getResult(history, isPercent, isEqual);
		historySegment.push(tempNumber);
		allHistory.push(historySegment)
		history = []; 
		isPercent = false;
	}
}

// Формирование HTML кода и вывода блока истории операции
function renderHistory(historyArray) {
	let htmlElements = '';
	historyArray.forEach((item) => {
		if(item >= 0) {
			htmlElements = htmlElements + `&nbsp;<span>${item}</span>`;
		} else if(['+', '-', '/', '*',].includes(item)) {
			item = item === '*'
				? '×'
				: item === '/' 
					? '÷' : item;
			htmlElements = htmlElements + `&nbsp;<strong>${item}</strong>`;
		}
	});
	return htmlElements;
}
// Функция отрисовки всей истории в панели истории
function historyPanelRender(allHistory) {
	const historyContent = document.getElementById('history-content');
	let historyPanelHtml = '';
	allHistory.forEach((item) => {
		const html = `
		<div>
      <div class="calc__history">
        ${renderHistory(item[0])}
      </div>
      <div class="calc__total">${item[1]}</div>
    </div>
		`
		historyPanelHtml = historyPanelHtml + html;
	})
	historyContent.innerHTML = historyPanelHtml;
}

// Выполнение операций
function getResult(historyArray, isPercent, isEqual) {
	let result = 0;
	historyArray.forEach((item, idx) => {
		item = parseFloat(item);
		if(idx === 0) {
			result = item;
		} else if(
			idx - 2 >= 0 
			&& isPercent 
			&& idx - 2 === historyArray.length - 3
		) {
			const x = result;
			const operation = historyArray[idx - 1];
			const n = item;

			if(!isEqual) {
				result = calculatePercent(x, operation, n);
				console.log(x, operation, n)
			} else {
				result = calculatePercentWhenPushEqual(x, operation, n)
			}
		} else if(idx - 2 >= 0) {
			const prevItem = historyArray[idx - 1];
			if(item >= 0) {
				if(prevItem === '+') {
					result = result + item;
				} else if(prevItem === '-') {
					result = result - item;
				} else if(prevItem === '*') {
					result = result * item;
				} else if( prevItem === '/') {
					result = result / item;
					
				} else if(prevItem === '%') {
					result = item / 100;
				}
			} 
		} 
	})
	return String(result);
}

// Пересчет процента когда нажат процент
function calculatePercent(x, operation, n) {
	let total;
	if(['+', '-'].includes(operation)) {
		total =  x * (n / 100);
	} else if(['*', '/'].includes(operation)) {
		total =  n / 100;
	}
	return total
}

// Пересчет процента когда нажато равно после нажатия процента
function calculatePercentWhenPushEqual(x, operation, n) {
	let total;
	if(operation === '+') {
		total = x + (n / 100 * x);
	} else if( operation === '-') {
		total = x - (n / 100 * x);
	} else if(operation === '*') {
		total = x * (n / 100);
	} else if(operation === '/') {
		total = x / (n / 100);
	}

	return total;
}

// Переключение темы калькулятора

let theme = calculator.querySelector('.theme')
theme.addEventListener('click', () => {
	if(theme.classList.contains('theme_dark')) {
		theme.classList.remove('theme_dark');
		calculator.classList.remove('calc_dark')
	} else {
		theme.classList.add('theme_dark');
		calculator.classList.add('calc_dark')
	}
})

// Открытие / скрытие окна истории
const historyPanel = document.getElementById('history-panel');
const closeHistoryBtn = historyPanel.querySelector('#close');

closeHistoryBtn.addEventListener('click', () => {
	historyPanel.classList.remove('open')
})

// Функция открытия панели истории
function openHistoryPanel() {
	historyPanel.classList.add('open');
}