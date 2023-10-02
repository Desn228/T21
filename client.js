//var Color = importNamespace('PixelCombats.ScriptingApi.Structures');

//var System = importNamespace('System');



//

var WaitingPlayersTime = 10;

var BuildBaseTime = 33;

var GameModeTime = 420;

var EndOfMatchTime = 10;



//

var WaitingStateValue = "Waiting";

var BuildModeStateValue = "BuildMode";

var GameStateValue = "Game";

var EndOfMatchStateValue = "EndOfMatch";



//

var mainTimer = Timers.GetContext().Get("Main");

var stateProp = Properties.GetContext().Get("State");



//

Damage.FriendlyFire = GameMode.Parameters.GetBool("FriendlyFire");

Map.Rotation = GameMode.Parameters.GetBool("MapRotation");

BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");

BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");



//

BreackGraph.PlayerBlockBoost = true;



//

Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";

Ui.GetContext().MainTimerId.Value = mainTimer.Id;

//

Teams.Add("Blue", "Люди", { b: 1 });

Teams.Add("Red", "Зомби", { g: 1 });

var blueTeam = Teams.Get("Blue");

var redTeam = Teams.Get("Red");

blueTeam.Spawns.SpawnPointsGroups.Add(1);

redTeam.Spawns.SpawnPointsGroups.Add(2);

blueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;

redTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;

redTeam.contextedProperties.MaxHp.Value = 370;

redTeam.contextedProperties.SkinType.Value = 1;





//

Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()

  var des = "Люди:" + Teams.Get("Blue").Count;

  var sed = "Зомби:" + Teams.Get("Red").Count; 

Teams.Get("Blue").Properties.Get("des").Value = des; 

Teams.Get("Red").Properties.Get("sed").Value = sed; 

  Ui.GetContext().TeamProp1.Value = {Team: "Blue", Prop: "des"}; 

  Ui.GetContext().TeamProp2.Value = {Team: "Red", Prop: "sed"};});









//

Damage.OnDeath.Add(function(player) {

	if(player.Properties.Kills.Value == 1) {

	} else if(stateProp.Value == "Game" && player.Team == blueTeam) {

		redTeam.Add(player);

 }

	if(stateProp.Value !== "Game")player.Spawns.Spawn();

});







//

LeaderBoard.PlayerLeaderBoardValues = [

	{

		Value: "Kills",

		DisplayName: "Statistics/Kills",

		ShortDisplayName: "Statistics/KillsShort"

	},

	{

		Value: "Scores",

		DisplayName: "Statistics/Scores",

		ShortDisplayName: "Statistics/ScoresShort"

	}

];

LeaderBoard.TeamLeaderBoardValue = {

	Value: "Deaths",

	DisplayName: "Statistics\Deaths",

	ShortDisplayName: "Statistics\Deaths"

};

//

LeaderBoard.TeamWeightGetter.Set(function(team) {

	return team.Properties.Get("Deaths").Value;

});

//

LeaderBoard.PlayersWeightGetter.Set(function(player) {

	return player.Properties.Get("Kills").Value;

});



//

Teams.OnRequestJoinTeam.Add(function(player,team){team.Add(player);});

//

Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()});



//

Damage.OnKill.Add(function(player, killed) {

	if (killed.Team != null && killed.Team != player.Team) {

		++player.Properties.Kills.Value;

		player.Properties.Scores.Value += 9999999;

	}

});



//

mainTimer.OnTimer.Add(function() {

	switch (stateProp.Value) {

	case WaitingStateValue:

		SetBuildMode();

		break;

	case BuildModeStateValue:

		SetGameMode();

		break;

	case GameStateValue:

		SetEndOfMatchMode();

		break;

	case EndOfMatchStateValue:

		RestartGame();

		break;

	}

});



//

SetWaitingMode();



//

function SetWaitingMode() {

	stateProp.Value = WaitingStateValue;

	Ui.GetContext().Hint.Value = "Hint/WaitingPlayers";

	Spawns.GetContext().enable = false;

	mainTimer.Restart(WaitingPlayersTime);

}



function SetBuildMode() 

{

	stateProp.Value = BuildModeStateValue;

	Ui.GetContext().Hint.Value = "стройте";

	var inventory = Inventory.GetContext();

	inventory.Main.Value = false;

	inventory.Secondary.Value = false;

	inventory.Melee.Value = true;

	inventory.Explosive.Value = false;

	inventory.Build.Value = true;



	mainTimer.Restart(BuildBaseTime);

	Spawns.GetContext().enable = true;

	SpawnTeams();

}

function SetGameMode() 

{

	stateProp.Value = GameStateValue;

	Ui.GetContext().Hint.Value = "Зомби Атака";



	var inventory = Inventory.GetContext();

	if (GameMode.Parameters.GetBool("OnlyKnives")) {

		inventory.Main.Value = false;

		inventory.Secondary.Value = false;

		inventory.Melee.Value = true;

		inventory.Explosive.Value = false;

		inventory.Build.Value = true;

	} else {

		inventory.Main.Value = false;

		blueTeam.inventory.Secondary.Value = true;

		redTeam.inventory.Melee.Value = true;

		inventory.Explosive.Value = false;

		inventory.Build.Value = true;

	}



	mainTimer.Restart(GameModeTime);

	Spawns.GetContext().Despawn();

	SpawnTeams();

}

function SetEndOfMatchMode() {

	stateProp.Value = EndOfMatchStateValue;

	Ui.GetContext().Hint.Value = "Hint/EndOfMatch";



	var spawns = Spawns.GetContext();

	spawns.enable = false;

	spawns.Despawn();

	Game.GameOver(LeaderBoard.GetTeams());

	mainTimer.Restart(EndOfMatchTime);

}

function RestartGame() {

	Game.RestartGame();

}



function SpawnTeams() {

	var e = Teams.GetEnumerator();

	while (e.moveNext()) {

		Spawns.GetContext(e.Current).Spawn();

	}

}



