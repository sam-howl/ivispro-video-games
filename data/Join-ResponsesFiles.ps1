[cmdletbinding()]
param()

function CreateGameObject($SteamGame, $RawgIOGame) {
    $totalGames = $SteamGame.positive + $SteamGame.negative
    if ($totalGames -eq 0) {
        $rating = 0
    } else {
        $rating = $SteamGame.positive / $totalGames
    }
    $GameObject = [PSCustomObject]@{
        name = $SteamGame.name
        developer = $SteamGame.developer
        publisher = $SteamGame.publisher
        owners = $SteamGame.owners
        average_forever = $SteamGame.average_forever
        price = $SteamGame.price
        initialprice = $SteamGame.initialprice
        released = $RawgIOGame.released
        background_image = $RawgIOGame.background_image
        rating = $rating
        parent_platforms = $RawgIOGame.parent_platforms
        genres = $RawgIOGame.genres

    }
    return $GameObject
}

$SteamResponsePath = "D:\git\fhnw-ivis\project\steam_response.json"
$SteamResponse = Get-Content -Path $SteamResponsePath | ConvertFrom-Json
$ResultList = New-Object System.Collections.ArrayList
$RawgParentPath = "D:\git\fhnw-ivis\project"
$RawgPartialFileName = "response-20200324"
$NumFiles = 10
for($i = 0; $i -lt $NumFiles; $i++) {
    Write-Verbose "Loading file number $i"
    $Path = "$RawgParentPath\$RawgPartialFileName-$i.json"
    try {

        $RawgIOResponse = Get-Content -Path $Path | ConvertFrom-Json
    } catch {
        Write-Error -Message "File $Path couldn't be parsed"
        Write-Host $_.Exception.Message.Substring(0, 5000) -ForegroundColor Red
    }

    foreach($RawgGame in $RawgIOResponse) {
        foreach($SteamGame in $SteamResponse) {
            if($RawgGame.name -eq $SteamGame.name -and $null -ne $RawgGame.released) {
                $GameObj = CreateGameObject -SteamGame $SteamGame -RawgIOGame $RawgGame
                $null = $ResultList.Add($GameObj)
            }
        }
    }
    $RawgIOResponse = $null
    Write-Verbose "Finished file number $i"
}

Write-Verbose "Found $($ResultList.Count) Games"
$OutFileName = "D:\git\fhnw-ivis\project\game_data.json"
$ResultList | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutFileName