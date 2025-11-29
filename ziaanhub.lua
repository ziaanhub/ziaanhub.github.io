local function SafeGet(url)
    local ok, result = pcall(function()
        return game:HttpGet(url)
    end)
    return ok and result or nil
end

-- Fuck
local data = SafeGet("https://ziaanbase.github.io/core/ziaanhub.lua")
if not data then return end

local Games = loadstring(data)()

-- You
local URL = Games[game.PlaceId]
if not URL then return end

-- Skid, Your mama is better
local scriptContent = SafeGet(URL)
if not scriptContent then return end

loadstring(scriptContent)()
