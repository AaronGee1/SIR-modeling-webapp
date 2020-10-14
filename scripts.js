class GlobalModel {
  constructor() {
    this.numberOfModels = 1;
    this.id = GlobalModel.id;
    console.log(this.id);
    GlobalModel.addModel();
  }

  static id = {
    mainDivId: "chart-1",
    deleteButtonId: "deleteButton-1",
    susceptibleCountId: "susceptibleCount-1",
    infectiousCountId: "infectiousCount-1",
    removedCountId: "removedCount-1",
    rnotId: "rnot-1",
    canvasId: "myChart-1",
    playButtonId: "play-1",
    pauseButtonId: "pause-1",
    stepBackButtonId: "stepBack-1",
    stepFowardButtonId: "stepFoward-1",
    resetButtonId: "resetDataset-1",
    populationInputId: "population-1",
    intialInfectedId: "intialInfected-1",
    betaSliderId: "betaSlider-1",
    betaTextBoxId: "betaTextBox-1",
    gammaSliderId: "gammaSlider-1",
    gammaTextBoxId: "gammaTextBox-1",
  };

  static numberOfModels = 1;

  static addModel() {
    this.numberOfModels = this.numberOfModels + 1;
    if (this.numberOfModels > 10) {
      this.numberOfModels = 1;
    }

    for (let id in GlobalModel.id) {
      let str = GlobalModel.id[id];
      str = str.substring(0, str.length - 1);
      str = str + this.numberOfModels;
      GlobalModel.id[id] = str;
    }
  }
}

class ChartVariables {
  constructor(state) {
    this.totalPopulation = document.getElementById(
      state.id["populationInputId"]
    ).value;
    this.infectiousGroup = parseFloat(
      document.getElementById(state.id["intialInfectedId"].value)
    );
    this.susceptibleGroup = this.totalPopulation - this.infectiousGroup;
    this.recoveredGroup = 0;
    this.day = 0;
    this.betaSlider = document.getElementById(state.id["betaSliderId"]);
    this.gammaSlider = document.getElementById(state.id["gammaSliderId"]);
    this.beta = this.betaSlider.value;
    this.betaHistory = [this.beta];
    this.gamma = this.gammaSlider.value;
    this.gammaHistory = [this.gamma];
    this.Rnot = this.beta / this.gamma;
    this.RnotHistory = [this.Rnot];
    this.ds_dt =
      (-this.beta * this.infectiousGroup * this.susceptibleGroup) /
      this.totalPopulation;
    this.di_dt =
      (this.beta * this.infectiousGroup * this.susceptibleGroup) /
        this.totalPopulation -
      this.gamma * this.infectiousGroup;
    this.pause = true;
    this.susceptibleCount = document.getElementById(
      state.id["susceptibleCountId"]
    );
    this.infectiousCount = document.getElementById(
      state.id["infectiousCountId"]
    );
    this.removedCount = document.getElementById(state.id["removedCountId"]);
    this.rnot = document.getElementById(state.id["rnotId"]);
    this.test = 1;
    this.betaTextBox = document.getElementById(state.id["betaTextBoxId"]);
    this.gammaTextBox = document.getElementById(state.id["gammaTextBoxId"]);
    this.mainDivId = document.getElementById(state.id["mainDivId"]);
  }
}

// // EVENT LISTENER
document.getElementById("newModel").addEventListener("click", function () {
  newModel();
});

// FUNCTIONS
function initializeChart(state) {
  // INTIALIZE VARIABLES
  let chartVariables = new ChartVariables(state);

  // INITIALIZE CHART
  let ctx = document.getElementById(state.id["canvasId"]).getContext("2d");
  let myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [chartVariables.day],
      datasets: [
        {
          label: "Susceptible",
          data: [chartVariables.susceptibleGroup],
          backgroundColor: ["rgba(30, 30, 255, 0.2"],
          borderColor: ["rgba(30,30,255,0.5"],
        },
        {
          label: "Infected",
          data: [chartVariables.infectiousGroup],
          backgroundColor: ["rgba(255, 30, 30, 0.2"],
          borderColor: ["rgba(255,30,30,0.5"],
        },
        {
          label: "Recovered",
          data: [chartVariables.recoveredGroup],
          backgroundColor: ["rgba(200,200,200,0.2)"],
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });

  // EVENT LISTENER
  document
    .getElementById(state.id["deleteButtonId"])
    .addEventListener("click", function () {
      chartVariables.mainDivId.remove();
      console.log("todo");
    });

  document
    .getElementById(state.id["playButtonId"])
    .addEventListener("click", function () {
      if (chartVariables.day == 0) {
        initializeVariables(state, chartVariables, myChart);
      }
      chartVariables.pause = false;
      startSim(chartVariables, myChart);
    });

  document
    .getElementById(state.id["pauseButtonId"])
    .addEventListener("click", function () {
      chartVariables.pause = true;
    });

  document
    .getElementById(state.id["stepBackButtonId"])
    .addEventListener("click", function () {
      backwardStep(chartVariables, myChart);
      updateCount(chartVariables);
      myChart.update();
    });

  document
    .getElementById(state.id["stepFowardButtonId"])
    .addEventListener("click", function () {
      if (chartVariables.day == 0) {
        initializeVariables(state, chartVariables, myChart);
      }
      forwardStep(chartVariables, myChart);
      updateCount(chartVariables);
      myChart.update();
    });

  document
    .getElementById(state.id["resetButtonId"])
    .addEventListener("click", function () {
      chartVariables.pause = true;
      setTimeout(() => {
        initializeVariables(state, chartVariables, myChart);
        updateCount(chartVariables);
        myChart.update();
      }, 100);
    });

  // javascript for slider and textbox functionality
  chartVariables.betaSlider.oninput = function () {
    chartVariables.betaTextBox.value = this.value;
  };

  chartVariables.betaTextBox.oninput = function () {
    chartVariables.betaSlider.value = this.value;
  };

  chartVariables.gammaSlider.oninput = function () {
    chartVariables.gammaTextBox.value = this.value;
  };

  chartVariables.gammaTextBox.oninput = function () {
    chartVariables.gammaSlider.value = this.value;
  };
}

function initializeVariables(state, chartVariables, myChart) {
  chartVariables.pause = true;
  chartVariables.totalPopulation = document.getElementById(
    state.id["populationInputId"]
  ).value;
  chartVariables.infectiousGroup = parseFloat(
    document.getElementById(state.id["intialInfectedId"]).value
  );
  chartVariables.susceptibleGroup =
    chartVariables.totalPopulation - chartVariables.infectiousGroup;

  R = [0];
  recoveredGroup = 0;
  chartVariables.day = 0;

  chartVariables.beta = chartVariables.betaSlider.value;
  chartVariables.betaHistory = [chartVariables.beta];
  chartVariables.gamma = chartVariables.gammaSlider.value;
  chartVariables.gammaHistory = [chartVariables.gamma];
  chartVariables.Rnot = chartVariables.beta / chartVariables.gamma;
  chartVariables.RnotHistory = [chartVariables.Rnot];

  chartVariables.ds_dt =
    (-chartVariables.beta *
      chartVariables.infectiousGroup *
      chartVariables.susceptibleGroup) /
    chartVariables.totalPopulation;
  chartVariables.di_dt =
    (chartVariables.beta *
      chartVariables.infectiousGroup *
      chartVariables.susceptibleGroup) /
      chartVariables.totalPopulation -
    chartVariables.gamma * chartVariables.infectiousGroup;
  chartVariables.dr_dt = chartVariables.gamma * chartVariables.infectiousGroup;

  myChart.data.labels = [chartVariables.day];
  myChart.data.datasets[0].data = [chartVariables.susceptibleGroup];
  myChart.data.datasets[1].data = [chartVariables.infectiousGroup];
  myChart.data.datasets[2].data = [chartVariables.recoveredGroup];

  chartVariables.test = 2;

  return [chartVariables, myChart];
}

function forwardStep(chartVariables, myChart) {
  chartVariables.beta = chartVariables.betaSlider.value;
  chartVariables.betaHistory.push(chartVariables.beta);
  chartVariables.gamma = chartVariables.gammaSlider.value;
  chartVariables.gammaHistory.push(chartVariables.gamma);
  chartVariables.Rnot = chartVariables.beta / chartVariables.gamma;
  chartVariables.RnotHistory.push(chartVariables.Rnot);

  chartVariables.susceptibleGroup =
    myChart.data.datasets[0].data[chartVariables.day];
  chartVariables.infectiousGroup =
    myChart.data.datasets[1].data[chartVariables.day];
  chartVariables.recoveredGroup =
    myChart.data.datasets[2].data[chartVariables.day];

  if (chartVariables.infectiousGroup > 0.01) {
    chartVariables.ds_dt =
      (-chartVariables.beta *
        chartVariables.infectiousGroup *
        chartVariables.susceptibleGroup) /
      chartVariables.totalPopulation;

    chartVariables.di_dt =
      (chartVariables.beta *
        chartVariables.infectiousGroup *
        chartVariables.susceptibleGroup) /
        chartVariables.totalPopulation -
      chartVariables.gamma * chartVariables.infectiousGroup;
    chartVariables.dr_dt =
      chartVariables.gamma * chartVariables.infectiousGroup;

    chartVariables.susceptibleGroup =
      myChart.data.datasets[0].data[chartVariables.day] + chartVariables.ds_dt;
    chartVariables.infectiousGroup =
      myChart.data.datasets[1].data[chartVariables.day] + chartVariables.di_dt;
    chartVariables.recoveredGroup =
      myChart.data.datasets[2].data[chartVariables.day] + chartVariables.dr_dt;

    chartVariables.day = chartVariables.day + 1;

    myChart.data.labels.push(chartVariables.day);
    myChart.data.datasets[0].data.push(chartVariables.susceptibleGroup);
    myChart.data.datasets[1].data.push(chartVariables.infectiousGroup);
    myChart.data.datasets[2].data.push(chartVariables.recoveredGroup);
  }
}

function nextStep(chartVariables, myChart) {
  return new Promise((resolve) => {
    setTimeout(() => {
      forwardStep(chartVariables, myChart);
      updateCount(chartVariables);
      chartVariables.test = 3;
      myChart.update(0);
      if (
        chartVariables.infectiousGroup > 0.01 &&
        chartVariables.pause == false
      ) {
        nextStep(chartVariables, myChart);
      }
    }, 100);
  });
}

function backwardStep(chartVariables, myChart) {
  if (chartVariables.day > 0) {
    chartVariables.day = chartVariables.day - 1;
    chartVariables.betaHistory.pop();
    chartVariables.gammaHistory.pop();
    chartVariables.RnotHistory.pop();

    chartVariables.betaSlider.value =
      chartVariables.betaHistory[chartVariables.day];
    chartVariables.betaTextBox.value =
      chartVariables.betaHistory[chartVariables.day];
    chartVariables.beta = chartVariables.betaHistory[chartVariables.day];

    chartVariables.gammaSlider.value =
      chartVariables.gammaHistory[chartVariables.day];
    chartVariables.gammaTextBox.value =
      chartVariables.gammaHistory[chartVariables.day];
    chartVariables.gamma = chartVariables.gammaHistory[chartVariables.day];

    chartVariables.Rnot = chartVariables.RnotHistory[chartVariables.day];

    chartVariables.susceptibleGroup =
      myChart.data.datasets[0].data[chartVariables.day];
    chartVariables.infectiousGroup =
      myChart.data.datasets[1].data[chartVariables.day];
    chartVariables.recoveredGroup =
      myChart.data.datasets[2].data[chartVariables.day];

    myChart.data.labels.pop();
    myChart.data.datasets[0].data.pop();
    myChart.data.datasets[1].data.pop();
    myChart.data.datasets[2].data.pop();
  }
}

async function startSim(chartVariables, myChart) {
  await nextStep(chartVariables, myChart);
}

function updateCount(chartVariables) {
  chartVariables.susceptibleCount.innerHTML = parseInt(
    chartVariables.susceptibleGroup
  );
  chartVariables.infectiousCount.innerHTML = parseInt(
    chartVariables.infectiousGroup
  );
  chartVariables.removedCount.innerHTML = parseInt(
    chartVariables.recoveredGroup
  );
  chartVariables.rnot.innerHTML = chartVariables.Rnot.toFixed(2);
}

function newModel() {
  let state = new GlobalModel();
  let mainDiv = document.createElement("div");
  mainDiv.className = "chart card";
  mainDiv.id = state.id["mainDivId"];

  let modelSelectionButton = document.createElement("button");
  modelSelectionButton.innerHTML = "SIR MODEL";
  modelSelectionButton.className = "btn";

  let deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Delete!";
  deleteButton.className = "btn btn-danger";
  deleteButton.id = state.id["deleteButtonId"];

  let title = document.createElement("h1");
  title.innerHTML = "SIR MODEL";

  let containerDiv = document.createElement("div");
  containerDiv.className = "container";

  let rowDiv = document.createElement("div");
  rowDiv.className = "row";

  let susceptibleDiv = document.createElement("div");
  susceptibleDiv.className = "col-sm";

  let susceptibleHeading = document.createElement("h2");
  susceptibleHeading.innerHTML = "Susceptible: ";

  let susceptibleSpan = document.createElement("span");
  susceptibleSpan.id = state.id["susceptibleCountId"];

  let infectiousDiv = document.createElement("div");
  infectiousDiv.className = "col-sm";

  let infectiousHeading = document.createElement("h2");
  infectiousHeading.innerHTML = "Infectious: ";

  let infectiousSpan = document.createElement("span");
  infectiousSpan.id = state.id["infectiousCountId"];

  let removedDiv = document.createElement("div");
  removedDiv.className = "col-sm";

  let removedHeading = document.createElement("h2");
  removedHeading.innerHTML = "Removed: ";

  let removedSpan = document.createElement("span");
  removedSpan.id = state.id["removedCountId"];

  let RnotDiv = document.createElement("div");
  RnotDiv.className = "col-sm";

  let RnotHeading = document.createElement("h2");
  RnotHeading.innerHTML = "R_not: ";

  let RnotSpan = document.createElement("span");
  RnotSpan.id = state.id["rnotId"];

  let canvas = document.createElement("canvas");
  canvas.id = state.id["canvasId"];

  let br = document.createElement("br");

  let spanButton = document.createElement("span");

  let playButton = document.createElement("button");
  playButton.className = "btn btn-primary";
  playButton.innerHTML = "Play";
  playButton.id = state.id["playButtonId"];

  let pauseButton = document.createElement("button");
  pauseButton.className = "btn btn-secondary";
  pauseButton.innerHTML = "Pause";
  pauseButton.id = state.id["pauseButtonId"];

  let stepBackButton = document.createElement("button");
  stepBackButton.className = "btn btn-success";
  stepBackButton.innerHTML = "Step back";
  stepBackButton.id = state.id["stepBackButtonId"];

  let stepForwardButton = document.createElement("button");
  stepForwardButton.className = "btn btn-success";
  stepForwardButton.innerHTML = "Step through";
  stepForwardButton.id = state.id["stepFowardButtonId"];

  let resetButton = document.createElement("button");
  resetButton.className = "btn btn-danger";
  resetButton.innerHTML = "Reset";
  resetButton.id = state.id["resetButtonId"];

  let populationSpan = document.createElement("span");

  let populationLabel = document.createElement("label");
  populationLabel.innerHTML = "Population";
  populationLabel.for = "population";

  let populationInput = document.createElement("input");
  populationInput.type = "number";
  populationInput.value = "100";
  populationInput.id = state.id["populationInputId"];

  let infectedLabel = document.createElement("label");
  infectedLabel.innerHTML = "Infected";
  infectedLabel.for = "intialInfected";

  let infectedInput = document.createElement("input");
  infectedInput.type = "number";
  infectedInput.value = "1";
  infectedInput.id = state.id["intialInfectedId"];

  let variableSpan = document.createElement("span");

  let betaLabel = document.createElement("label");
  betaLabel.for = "beta";
  betaLabel.innerHTML = "Beta";

  let betaSliderInput = document.createElement("input");
  betaSliderInput.type = "range";
  betaSliderInput.step = "0.01";
  betaSliderInput.min = "0.01";
  betaSliderInput.max = "1";
  betaSliderInput.value = "0.5";
  betaSliderInput.id = state.id["betaSliderId"];

  let betaTextBoxInput = document.createElement("input");
  betaTextBoxInput.type = "number";
  betaTextBoxInput.step = "0.01";
  betaTextBoxInput.min = "0.01";
  betaTextBoxInput.max = "1";
  betaTextBoxInput.value = "0.5";
  betaTextBoxInput.id = state.id["betaTextBoxId"];

  let gammaLabel = document.createElement("label");
  gammaLabel.for = "gamma";
  gammaLabel.innerHTML = "Gamma";

  let gammaSliderInput = document.createElement("input");
  gammaSliderInput.type = "range";
  gammaSliderInput.step = "0.01";
  gammaSliderInput.min = "0.01";
  gammaSliderInput.max = "1";
  gammaSliderInput.value = "0.5";
  gammaSliderInput.id = state.id["gammaSliderId"];

  let gammaTextBoxInput = document.createElement("input");
  gammaTextBoxInput.type = "number";
  gammaTextBoxInput.step = "0.01";
  gammaTextBoxInput.min = "0.01";
  gammaTextBoxInput.max = "1";
  gammaTextBoxInput.value = "0.5";
  gammaTextBoxInput.id = state.id["gammaTextBoxId"];

  document.body.appendChild(mainDiv);
  mainDiv.appendChild(modelSelectionButton);
  mainDiv.appendChild(deleteButton);
  mainDiv.appendChild(title);
  mainDiv.appendChild(containerDiv);
  containerDiv.appendChild(rowDiv);

  rowDiv.appendChild(susceptibleDiv);
  susceptibleDiv.appendChild(susceptibleHeading);
  susceptibleHeading.appendChild(susceptibleSpan);

  rowDiv.appendChild(infectiousDiv);
  infectiousDiv.appendChild(infectiousHeading);
  infectiousHeading.appendChild(infectiousSpan);

  rowDiv.appendChild(removedDiv);
  removedDiv.appendChild(removedHeading);
  removedHeading.appendChild(removedSpan);

  rowDiv.appendChild(RnotDiv);
  RnotDiv.appendChild(RnotHeading);
  RnotHeading.appendChild(RnotSpan);

  mainDiv.appendChild(canvas);
  mainDiv.appendChild(br);
  mainDiv.appendChild(br);

  mainDiv.appendChild(spanButton);
  spanButton.appendChild(playButton);
  spanButton.appendChild(pauseButton);
  spanButton.appendChild(stepBackButton);
  spanButton.appendChild(stepForwardButton);
  spanButton.appendChild(resetButton);

  mainDiv.appendChild(populationSpan);
  populationSpan.appendChild(populationLabel);
  populationSpan.appendChild(populationInput);
  populationSpan.appendChild(infectedLabel);
  populationSpan.appendChild(infectedInput);

  mainDiv.appendChild(variableSpan);
  variableSpan.appendChild(betaLabel);
  variableSpan.appendChild(betaSliderInput);
  variableSpan.appendChild(betaTextBoxInput);
  variableSpan.appendChild(gammaLabel);
  variableSpan.appendChild(gammaSliderInput);
  variableSpan.appendChild(gammaTextBoxInput);

  initializeChart(state);
}
