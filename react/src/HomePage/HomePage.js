import React from "react";
import Menu from "../Menu/Menu";

function HomePage() {
	return (
		<main className="center" id="homepage">
			<p>Personal Budget is an awesome personal budget management app.</p>

			<p>
				Personal Budget is the most important app if you want to keep
				track of your personal finances. Most people spend a lot of time
				managing their financials and can do a lot better in doing so.
				There are many tools to help manage your finances, the best is
				Personal Budget.
			</p>
			<p>Some of the features of Personal Budget are:</p>
			<ul>
				<li>Track your spending on a budget</li>
				<li>Plan your monthly spending</li>
				<li>Trim your income</li>
				<li>Adjust your spending</li>
			</ul>
			<Menu />
		</main>
	);
}

export default HomePage;
