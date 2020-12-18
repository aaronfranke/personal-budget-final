import React from "react";
import axios from "axios";
import Chart from "chart.js";
import { reactLocalStorage } from "reactjs-localstorage";
//import { useHistory } from "react-router-dom";

let singleton; // "this" doesn't work everywhere.

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			budgetData: null,
			income: null,
			savings: null,
			skip: false,
		};
		singleton = this;
	}

	createPieChart(budgetData) {
		let dataSource = {
			datasets: [
				{
					data: [],
					backgroundColor: [],
				},
			],
			labels: [],
		};
		// Populate the data structure with received values.
		for (var i = 0; i < budgetData.length; i++) {
			dataSource.datasets[0].data[i] = budgetData[i].budget;
			dataSource.datasets[0].backgroundColor[i] = budgetData[i].color;
			dataSource.labels[i] = budgetData[i].title;
		}
		let context = document.getElementById("pieChart").getContext("2d");
		// eslint-disable-next-line no-unused-vars
		let pieChart = new Chart(context, {
			type: "pie",
			data: dataSource,
		});
	}

	getBudget() {
		const data = {
			token: reactLocalStorage.get("jwt"),
		};
		axios.post(window.BACKEND_URL + "/api/get_budget", data).then((res) => {
			if (res && res.data) {
				if (res.data.ok === 1) {
					this.income = res.data.income;
					this.savings = res.data.savings;
					this.setState({
						budgetData: res.data.budgetData,
						income: res.data.income,
						savings: res.data.savings,
						skip: true,
					});
					this.createPieChart(res.data.budgetData);
				} else {
					const doc = document.getElementById("errorMessage");
					if (doc) {
						doc.innerText = res.data.error;
					} else {
						reactLocalStorage.remove("jwt");
						reactLocalStorage.remove("username");
						document.getElementById("main").innerText =
							res.data.error;
					}
				}
			} else {
				document.getElementById("errorMessage").innerText =
					"Error: Unknown error.";
				console.log(res);
			}
		});
	}

	setIncome() {
		const data = {
			token: reactLocalStorage.get("jwt"),
			income: document.getElementById("income").value,
		};
		// Check the length of the income.
		if (data.income.length < 1) {
			document.getElementById("errorMessage").innerText =
				"Error: Income can't be empty.";
			return;
		}
		// The basic checks we can do without the database are done,
		// so next we need to connect to the database.
		axios.post(window.BACKEND_URL + "/api/set_income", data).then((res) => {
			if (res && res.data) {
				if (res.data.ok === 1) {
					singleton.setState({
						skip: false,
					});
				} else {
					document.getElementById("errorMessage").innerText =
						res.data.error;
				}
			} else {
				document.getElementById("errorMessage").innerText =
					"Error: Unknown error.";
				console.log(res);
			}
		});
	}

	setSavings() {
		const data = {
			token: reactLocalStorage.get("jwt"),
			savings: document.getElementById("savings").value,
		};
		// Check the length of the income.
		if (data.savings.length < 1) {
			document.getElementById("errorMessage").innerText =
				"Error: Savings can't be empty.";
			return;
		}
		// The basic checks we can do without the database are done,
		// so next we need to connect to the database.
		axios
			.post(window.BACKEND_URL + "/api/set_savings", data)
			.then((res) => {
				if (res && res.data) {
					if (res.data.ok === 1) {
						singleton.setState({
							skip: false,
						});
					} else {
						document.getElementById("errorMessage").innerText =
							res.data.error;
					}
				} else {
					document.getElementById("errorMessage").innerText =
						"Error: Unknown error.";
					console.log(res);
				}
			});
	}

	addToBudget() {
		const data = {
			token: reactLocalStorage.get("jwt"),
			title: document.getElementById("title").value,
			budget: document.getElementById("budget").value,
			color: document.getElementById("color").value,
		};
		// Check the length of the username and password.
		if (data.title.length < 3) {
			document.getElementById("errorMessage").innerText =
				"Error: Title too short.";
			return;
		}
		if (data.budget.length < 1) {
			document.getElementById("errorMessage").innerText =
				"Error: Budget can't be empty.";
			return;
		}
		// The basic checks we can do without the database are done,
		// so next we need to connect to the database.
		axios
			.post(window.BACKEND_URL + "/api/add_to_budget", data)
			.then((res) => {
				if (res && res.data) {
					if (res.data.ok === 1) {
						singleton.setState({
							budgetData: res.data.budgetData,
							skip: false,
						});
					} else {
						document.getElementById("errorMessage").innerText =
							res.data.error;
					}
				} else {
					document.getElementById("errorMessage").innerText =
						"Error: Unknown error.";
					console.log(res);
				}
			});
	}

	deleteFromBudget(title) {
		const data = {
			token: reactLocalStorage.get("jwt"),
			title: title,
		};
		axios
			.post(window.BACKEND_URL + "/api/delete_from_budget", data)
			.then((res) => {
				if (res && res.data) {
					if (res.data.ok === 1) {
						singleton.setState({
							budgetData: res.data.budgetData,
							skip: false,
						});
					} else {
						document.getElementById("errorMessage").innerText =
							res.data.error;
					}
				} else {
					document.getElementById("errorMessage").innerText =
						"Error: Unknown error.";
					console.log(res);
				}
			});
	}

	render() {
		//const history = useHistory();
		if (!this.state.skip) {
			this.getBudget();
		}

		if (!this.state.budgetData) {
			return (
				<main className="center" id="main">
					Loading, please wait...
				</main>
			);
		}

		let budgetTable;
		let statistics = "";
		if (this.state.budgetData.length === 0) {
			budgetTable = (
				<p>
					You don't have any budget data yet! Get started by adding
					some budget data below.
				</p>
			);
		} else {
			let budgetElements = [];
			budgetElements.push(
				<thead key={-2}>
					<tr>
						<th>Title</th>
						<th>Budget</th>
						<th>Bar Chart</th>
						<th>Color</th>
						<th>Delete</th>
					</tr>
				</thead>
			);

			let maxBudget = 0;
			let totalBudget = 0;
			for (let i = 0; i < this.state.budgetData.length; i++) {
				const budget = this.state.budgetData[i].budget;
				maxBudget = Math.max(maxBudget, budget);
				totalBudget += budget;
			}

			let bodyElements = [];
			for (let i = 0; i < this.state.budgetData.length; i++) {
				const element = this.state.budgetData[i];
				const width = (element.budget / maxBudget) * 100 + "%";
				bodyElements.push(
					<tr key={i}>
						<td>{element.title}</td>
						<td>${element.budget}</td>
						<td className="budgetTableBar">
							<div
								style={{
									width: width,
									backgroundColor: element.color,
								}}
							></div>
						</td>
						<td style={{ color: element.color }}>
							{element.color}
						</td>
						<td>
							<button
								onClick={() =>
									this.deleteFromBudget(element.title)
								}
							>
								Delete
							</button>
						</td>
					</tr>
				);
			}
			budgetElements.push(<tbody key={-1}>{bodyElements}</tbody>);
			budgetTable = <table id="budgetTable">{budgetElements}</table>;

			statistics =
				"Your budget accounts for $" +
				totalBudget +
				" in total expenses. ";
			let savings = this.state.savings;
			if (savings === undefined || savings === null) {
				savings = 0;
			} else {
				statistics += "You have $" + savings + " saved. ";
			}
			if (this.state.income > 0) {
				const profit = this.state.income - totalBudget;
				statistics +=
					"Since you earn an income of $" +
					this.state.income +
					", you are " +
					(profit > 0 ? "gaining" : "losing") +
					" $" +
					Math.abs(profit) +
					" dollars each month. ";
				if (profit > 0) {
					const timeMonths = (1000000 - savings) / profit;
					const timeYears = timeMonths / 12;
					statistics +=
						"If you save all your extra money, at this rate, you will be a millionaire in " +
						timeMonths.toFixed(1) +
						" months (" +
						timeYears.toFixed(1) +
						" years). ";
				} else {
					const timeMonths = Math.abs(savings / profit);
					const timeYears = timeMonths / 12;
					statistics +=
						"At this rate, you will be broke in " +
						timeMonths.toFixed(1) +
						" months (" +
						timeYears.toFixed(1) +
						" years). ";
				}
			} else {
				statistics +=
					"Enter an income and/or savings amount for more information. ";
			}
		}

		return (
			<main className="center" id="main">
				<div id="dashboard">
					<h1 className="row">Budget Dashboard</h1>

					<div id="budgetTableHolder">{budgetTable}</div>

					<div>
						<h2>Add to Budget</h2>
						<ul id="addToBudget">
							<li>
								<label htmlFor="title">Title</label>
								<input type="text" name="title" id="title" />
							</li>
							<li>
								<label htmlFor="budget">Budget</label>
								<input
									type="number"
									name="budget"
									id="budget"
								/>
							</li>
							<li>
								<label htmlFor="color">Color</label>
								<input type="text" name="color" id="color" />
							</li>
							<li>
								<button onClick={this.addToBudget}>Add</button>
							</li>
						</ul>
					</div>

					<div>
						<p id="errorMessage"></p>
					</div>

					<div id="pieChartHolder">
						<h2>Pie Chart</h2>
						<canvas id="pieChart" width="400" height="400"></canvas>
					</div>

					<div id="statisticsHolder">
						<h2>Statistics</h2>
						<p>{statistics}</p>
					</div>

					<div>
						<h2>Budget Settings</h2>
						<ul id="addToBudget">
							<li>
								<label htmlFor="income">Income</label>
								<input
									type="number"
									name="income"
									id="income"
								/>
							</li>
							<li>
								<button onClick={this.setIncome}>Set</button>
							</li>
							<li>
								<label htmlFor="savings">Savings</label>
								<input
									type="number"
									name="savings"
									id="savings"
								/>
							</li>
							<li>
								<button onClick={this.setSavings}>Set</button>
							</li>
						</ul>
					</div>
				</div>
			</main>
		);
	}
}

export default Dashboard;
