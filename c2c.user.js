// ==UserScript==
// @name        Clickpocalypse2ClickerWithToolbar
// @namespace   C2CT
// @description Clicker Bot for Clickpocalypse2 with Toolbar
// @include     http://minmaxia.com/c2/
// @version     1.1.0
// @grant       none
// @require https://code.jquery.com/jquery-3.1.0.slim.min.js
// ==/UserScript==

// This saves scrolls for boss encounters.
var scrollReserve = 15;

// This will fire scrolls no matter what, if we hit this limit... (so we can pick up new scrolls).
var scrollUpperBound = 29;

var autoClickerInterval = null;
var btnAutoClicker;
var skillsEnabled = false;
var btnSkills;
var potionsEnabled = false;
var btnPotions;
var chestsEnabled = false;
var btnChests;
var pointsEnabled = false;
var btnPoints;

var minorButtons = [];
var buttonsEnabled = false;

var styleHTML = ' \
	<style type="text/css"> \
		.divC2Clicker { position: absolute; left: 50%; top: 740px; width: 1024px; margin-left: -512px; border: 1px solid #2B2B32; padding: 1px; } \
		.tblC2Clicker td { padding: 2px; } \
		.clickerButton { height: 32px; padding: 2px; width: 100px; border: 1px solid #888; text-align: center; cursor: pointer; color: #fff; display: table-cell; vertical-align: middle; } \
    .clickerButton:hover { background-color: #2B2B32; } \
    .clickerButtonActive { background-color: rgba(255,170,0,0.4); border: 1px solid #FA0; } \
		.clickerButtonActive:hover { background-color: rgba(255,170,0,0.45); } \
    .clickerButtonDisabled, .clickerButtonDisabled:hover { background: #000; border: 1px solid #2B2B32; cursor: default; } \
	</style> \
';

var toolbarHTML = '<div id="divC2Clicker" class="divC2Clicker"><table id="tblC2Clicker" class="tblC2Clicker"><tr></tr></table></div>';

var buttonHTML = '<td><div class="clickerButton clickerButtonDisabled"></div></td>';

$(document).ready(function () {
	addToolbar();
});

function toggleAutoClicker() {
	if (autoClickerInterval === null) {
		console.log('Starting Clickpocalypse2Clicker: ' + GM_info.script.version);
		autoClickerInterval = setInterval(startAutoClicker, 1000);
		btnAutoClicker.addClass('clickerButtonActive');
		buttonsEnabled = true;
		for (var i=0; i<minorButtons.length; i++) {
			minorButtons[i].removeClass('clickerButtonDisabled');
			//minorButtons[i].click();
		}
	}
	else {
		console.log('Stopping Clickpocalypse2Clicker: ' + GM_info.script.version);
		clearInterval(autoClickerInterval);
		autoClickerInterval = null;
		btnAutoClicker.removeClass('clickerButtonActive');
		for (var i=0; i<minorButtons.length; i++) {
			minorButtons[i].addClass('clickerButtonDisabled');
		}
		buttonsEnabled = false;
	}
}

function toggleSkills() {
	if (buttonsEnabled) {
		skillsEnabled = !skillsEnabled;
		if (skillsEnabled)
		{
		 btnSkills.addClass('clickerButtonActive');
		}
		else
		{
			btnSkills.removeClass('clickerButtonActive');
		}
	}
}

function togglePotions() {
	if (buttonsEnabled) {
		potionsEnabled = !potionsEnabled;
	  if (potionsEnabled)
		{
			btnPotions.addClass('clickerButtonActive');
		}
	  else
		{
			btnPotions.removeClass('clickerButtonActive');
		}
	}
}

function toggleChests() {
	if (buttonsEnabled) {
		chestsEnabled = !chestsEnabled;
	  if (chestsEnabled)
		{
			btnChests.addClass('clickerButtonActive');
		}
	  else
		{
			btnChests.removeClass('clickerButtonActive');
		}
	}
}

function togglePoints() {
	if (buttonsEnabled) {
		pointsEnabled = !pointsEnabled;
	  if (pointsEnabled)
		{
			btnPoints.addClass('clickerButtonActive');
		}
	  else
		{
			btnPoints.removeClass('clickerButtonActive');
		}
	}
}

function addButton(toolbar, buttonText, buttonAction) {
	return $(buttonHTML).appendTo(toolbar).find('div.clickerButton').html(buttonText).click(buttonAction);
}

function addButtons() {
	var toolbar = $('#tblC2Clicker tr');

	btnAutoClicker = addButton(toolbar, "Toggle AutoClicker", toggleAutoClicker).removeClass('clickerButtonDisabled');
	btnSkills = addButton(toolbar, "Toggle Skills", toggleSkills);
	minorButtons.push(btnSkills);
	btnPotions = addButton(toolbar, "Toggle Potions", togglePotions);
	minorButtons.push(btnPotions);
	btnChests = addButton(toolbar, "Toggle Chests", toggleChests);
	minorButtons.push(btnChests);
	btnPoints = addButton(toolbar, "Toggle Points", togglePoints);
	minorButtons.push(btnPoints);
}

function addToolbar() {
	$('body').append(styleHTML).append(toolbarHTML);
	addButtons();
}

function startAutoClicker() {
	// Determines our encounter states
	var isBossEncounter = ($('.bossEncounterNotificationDiv').length != 0);
	var isEncounter = ($('#encounterNotificationPanel').css('display') !== 'none');
	//console.log("Boss: " +isBossEncounter +" Normal: " +isEncounter);

	// Determine if this is a difficult encounter... (one or more characters are stunned).
	//todo: should cancel search once we find it to be true.
	var isDifficultEncounter = false;
	// slot positions.
	var pos = ['A', 'B', 'C', 'E', 'E', 'F'];
	$.each(pos, function (idx) {
		var letter = pos[idx];

		// character positions.
		for (var char = 0; char < 5; char++) {

			var name = '#adventurerEffectIcon' + letter + char;
			var selector = $(name);
			//console.log("Checking: " + name + " Title: " + selector.attr('title') + " Display " + selector.css('display') + " HTML: " +selector.html());
			if (selector.attr('title') === 'Stunned' && selector.css('display') !== 'none') {
				isDifficultEncounter = true;

			}
		}
	});

	//console.log("isDifficultEncounter: " + isDifficultEncounter);

	// loot them chests... not sure which one of these is working.
	if (chestsEnabled) {
	  clickSelector($('#treasureChestLootButtonPanel').find('.gameTabLootButtonPanel'));
	  clickSelector($('#treasureChestLootButtonPanel').find('.lootButton'));
	}

	// Update AP Upgrades
	if (pointsEnabled) {
		for (var row = 0; row < 12; row++) {
			// skip 'Offline Time Bonus' upgrade.
			if (row == 3) {
				continue;
			}
			for (var col = 0; col < 2; col++) {

				var name = "#pointUpgradesContainer_" + row + "_" + col + "_" + row;

				clickIt(name);
			}
		}
	}

	// Cycle though all quick bar upgrades in reverse order.
	for (var i = 43; i >= 0; i--) {
		clickIt('#upgradeButtonContainer_' + i);
	}

	// Level up character skills.
	// No strategy yet, just click whatever is clickable
	if (skillsEnabled) {
		for (var charPos = 0; charPos < 5; charPos++) {
			for (var col = 0; col < 9; col++) {
				for (var row = 0; row < 4; row++) {
					// There is an ending col on all, not sure why yet
					clickIt('#characterSkillsContainer' + charPos + '_' + col + '_' + row + '_' + col);
				}
			}
		}
	}

	// Get information about potions are active before taking any actions

	var isPotionActive_ScrollsAutoFire = false;
	var isPotionActive_InfinteScrolls = false;
	var potionCount = 0;

	for (var row = 0; row < 4; row++) {
		for (var col = 0; col < 2; col++) {

			var potionSelector = $('#potionButton_Row' + row + '_Col' + col).find('.potionContentContainer');
			var potionName = potionSelector.find('td').eq(1).text();
			var potionActive = (potionSelector.find('.potionButtonActive').length != 0);

			if (potionName.length == 0) {
				continue;
			}

			potionCount++;

			if (potionName === 'Scrolls Auto Fire') {
				isPotionActive_ScrollsAutoFire = potionActive;
			}
			if (potionName === 'Infinite Scrolls') {
				isPotionActive_InfinteScrolls = potionActive;
			}

		}
	}

	//console.log ("AF: " +isPotionActive_ScrollsAutoFire +" IS: " +isPotionActive_InfinteScrolls +" Potion Count: " +potionCount );

	// Click them potions
	if (potionsEnabled) {
		for (var row = 0; row < 4; row++) {
			for (var col = 0; col < 2; col++) {

				var potionSelector = $('#potionButton_Row' + row + '_Col' + col).find('.potionContentContainer');
				var potionName = potionSelector.find('td').eq(1).text();
				var potionActive = (potionSelector.find('.potionButtonActive').length != 0);

				if (potionName.length == 0) {
					continue;
				}
				if (potionActive) {
					continue;
				}

				// We don't want to use AutoFire and InfinteScrolls together, since they have similar functions.
				if (potionName === 'Infinite Scrolls' && isPotionActive_ScrollsAutoFire) {
					continue;
				}
				if (potionName === 'Scrolls Auto Fire' && isPotionActive_InfinteScrolls) {
					continue;
				}

				// Always click farm bonus or fast walking potions as soon as we get them, since they are useful anywhere.
				if (potionName === 'Faster Infestation' || potionName === 'More Kills Per Farm' || potionName === 'Faster Farming' || potionName === 'Fast Walking') {
					clickSelector(potionSelector);
					continue;
				}


				// Only click these if we are in battle, no need to chug potions if we are walking around peaceful overworld.
				if (isBossEncounter || isEncounter) {

					if (potionName === 'Infinite Scrolls') {
						isPotionActive_InfinteScrolls = true;
					}
					if (potionName === 'Scrolls Auto Fire') {
						isPotionActive_ScrollsAutoFire = true;
					}

					if (potionName === 'Potions Last Longer') {
						if (potionCount < 6 && !(isPotionActive_InfinteScrolls || isPotionActive_ScrollsAutoFire)) {
							continue;
						}
					}

					if ( (potionName === 'Random Treasure Room' || potionName === 'Double Item Drops' || potionName === 'Double Gold Drops')  
						&& (isPotionActive_InfinteScrolls || isPotionActive_ScrollsAutoFire) ) {
						continue;
					}

					clickSelector(potionSelector);
				}

			}
		}
	}

	// Get info about scrolls before taking any action.
	var totalScrolls = 0;
	for (var i = 0; i < 6; i++) {

		var scrollCell = $('#scrollButtonCell' + i);
		var scrollButton = scrollCell.find('.scrollButton');
		var scrollAmount = scrollCell.find('tr').eq(1).text().replace('x', ''); ;

		if (!scrollAmount.length) {
			continue;
		}

		if (scrollAmount === 'Infinite' || isPotionActive_InfinteScrolls) {
			break;
		}

		// Don't count spider webs
		if (i != 1) {
			totalScrolls += parseInt(scrollAmount);
		}

	}

	//console.log("Total Scrolls:" +totalScrolls);


	// click them scrolls
	for (var i = 0; i < 6; i++) {

		var scrollCell = $('#scrollButtonCell' + i);
		var scrollButton = scrollCell.find('.scrollButton');
		var scrollAmount = scrollCell.find('tr').eq(1).text().replace('x', ''); ;

		if (!scrollAmount.length) {
			continue;
		}

		// Hitting limit, fire scrolls so we can pick up new ones.
		if (scrollAmount > scrollUpperBound) {
			clickSelector(scrollButton);
			continue;
		}


		// Spam spells if Infinite Scrolls potion is active.
		if (scrollAmount === 'Infinite' || isPotionActive_InfinteScrolls) {

			// 4 times per second
			clickSelector(scrollButton);
			setTimeout(clickSelector, 250, scrollButton);
			setTimeout(clickSelector, 500, scrollButton);
			setTimeout(clickSelector, 750, scrollButton);
			continue;
		}

		// Fire 0 scrolls if Autofire is active... it fires them for free, so let's not waste ours.
		// unless boss encounter, we still want to double up on the big guys...
		if (isPotionActive_ScrollsAutoFire && !isBossEncounter && !isDifficultEncounter) {
			continue;
		}

		// 1 === spider web scroll.  Always fire at normal encounters.
		// Boss are immune to spider web, so won't fire them.
		if (i == 1 && !isBossEncounter) {
			clickSelector(scrollButton);
		}


		if (i != 1) {

			// keep scrolls in reserve if generic encounter so we have them for boss.
			// No limit if this is a boss encounter
			if (scrollAmount > scrollReserve || isBossEncounter || isDifficultEncounter) {
				clickSelector(scrollButton);
			}

		}

	}

}

/*** Click by div id **/
function clickIt(divName) {
	var div = $(divName);
	if (!div.length) {
		return;
	} // They use mouse up instead of click()

	div.mouseup();
}
/*** Click by Selector **/
function clickSelector($selector) {
	$selector.mouseup();
}
