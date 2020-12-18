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
		axios.post("http://localhost:4000/api/get_budget", data).then((res) => {
			if (res && res.data) {
				if (res.data.ok === 1) {
					this.setState({
						budgetData: res.data.budgetData,
						skip: true,
					});
					this.createPieChart(res.data.budgetData);
				} else {
					const doc = document.getElementById("errorMessage");
					if (doc) {
						doc.innerText = res.data.error;
					} else {
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
			.post("http://localhost:4000/api/add_to_budget", data)
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
			.post("http://localhost:4000/api/delete_from_budget", data)
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
						<th>Bar</th>
						<th>Color</th>
						<th>Delete</th>
					</tr>
				</thead>
			);
			let bodyElements = [];
			for (let i = 0; i < this.state.budgetData.length; i++) {
				const element = this.state.budgetData[i];
				//const deleteMethod = "deleteFromBudget('" + element.title + "')";
				bodyElements.push(
					<tr key={i}>
						<td>{element.title}</td>
						<td>${element.budget}</td>
						<td class="budgetTableBar"></td>
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
				</div>
			</main>
		);
	}
}

export default Dashboard;
