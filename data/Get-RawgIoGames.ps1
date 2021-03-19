[cmdletbinding()]
param()

$Endpoint = "https://api.rawg.io/api/games"
$Games = @()
$GamesCount = 0
$FileCounter = 0
$Response = Invoke-RestMethod -Method Get -Uri $Endpoint -Verbose:$false
$FileName = "response-$(Get-Date -Format "yyyyMMdd")-$FileCounter.json"
while($null -ne $Response.next) {
    if($Games.Count -ge 1000) {
        $Games | ConvertTo-Json -Depth 10 | Out-File $FileName -Append
        if(((Get-Item $FileName).Length/1MB) -ge 512) {
            $FileCounter = $FileCounter + 1
            $FileName = "response-$(Get-Date -Format "yyyyMMdd")-$FileCounter.json"
        }
        $GamesCount = $GamesCount + $Games.Count
        Write-Verbose "$(Get-Date -Format "yyyyMMdd-hhmm"): fetched $GamesCount games now"
        $Games = @()
    }
    $Games += $Response.results
    Write-Debug "Next Uri: $($Response.next)"
    $Response = Invoke-RestMethod -Method Get -Uri $Response.next -Verbose:$false
}

$Games | ConvertTo-Json -Depth 10 | Out-File $FileName -Append
Write-Verbose "$(Get-Date -Format "yyyyMMdd-hhmm"): finished fetching games. Found $GamesCount games"