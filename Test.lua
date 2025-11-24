-- Enhanced Auto Skillcheck System
-- Universal version compatible with all executors

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local SoundService = game:GetService("SoundService")

-- Universal service detection
local VirtualInput
local HttpService
local isSupportedExecutor = true

-- Safe service initialization
pcall(function()
    VirtualInput = game:GetService("VirtualInputManager")
end)

pcall(function()
    HttpService = game:GetService("HttpService")
end)

-- Fallback input methods for unsupported executors
local function sendInput(keyCode, isPress)
    if VirtualInput then
        if isPress then
            VirtualInput:SendKeyEvent(true, keyCode, false, game)
        else
            VirtualInput:SendKeyEvent(false, keyCode, false, game)
        end
    else
        -- Alternative method for executors without VirtualInputManager
        if isPress then
            game:GetService("UserInputService"):SendKeyEvent(true, keyCode, false, nil)
        else
            game:GetService("UserInputService"):SendKeyEvent(false, keyCode, false, nil)
        end
    end
end

local player = Players.LocalPlayer
local PlayerGui = player:WaitForChild("PlayerGui")

-- ENHANCED SETTINGS WITH PERSISTENCE
local Settings = {
    enabled = true,
    hitZone = 2,
    anticipationOffset = 5,
    adaptiveMode = false,
    visualFeedback = true,
    audioFeedback = true,
    perfectHitBonus = true,
    autoAdjustDifficulty = false,
    uiScale = 1,
    positionX = 0.02,
    positionY = 0.3
}

-- Load settings from executor storage if available
local function loadSettings()
    if HttpService then
        local success, saved = pcall(function()
            -- Try to load from different possible storage locations
            if readfile then
                return readfile("auto_skillcheck_settings.json")
            end
        end)
        
        if success and saved then
            local ok, data = pcall(function()
                return HttpService:JSONDecode(saved)
            end)
            if ok and data then
                for key, value in pairs(data) do
                    if Settings[key] ~= nil then
                        Settings[key] = value
                    end
                end
            end
        end
    end
end

-- Save settings to executor storage if available
local function saveSettings()
    if HttpService then
        local success, err = pcall(function()
            if writefile then
                writefile("auto_skillcheck_settings.json", HttpService:JSONEncode(Settings))
            end
        end)
        return success
    end
    return false
end

-- Load settings on startup
loadSettings()

local State = {
    lastHitTime = 0,
    hitCooldown = 0.25,
    successCount = 0,
    totalAttempts = 0,
    averageDistance = 0,
    lastDistances = {},
    currentDifficulty = 1,
    needleSpeedHistory = {},
    lastNeedlePositions = {},
    isUILoaded = false
}

-- UNIVERSAL UI CREATION WITH ERROR HANDLING
local function createUI()
    local success, gui = pcall(function()
        local gui = Instance.new("ScreenGui")
        gui.Name = "EnhancedAutoSkillcheck"
        gui.ResetOnSpawn = false
        gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
        gui.Parent = PlayerGui

        -- Main container with glassmorphism effect
        local mainFrame = Instance.new("Frame")
        mainFrame.Size = UDim2.new(0, 380 * Settings.uiScale, 0, 200 * Settings.uiScale)
        mainFrame.Position = UDim2.new(Settings.positionX, 0, Settings.positionY, 0)
        mainFrame.AnchorPoint = Vector2.new(0, 0.5)
        mainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
        mainFrame.BackgroundTransparency = 0.15
        mainFrame.BorderSizePixel = 0
        mainFrame.Parent = gui

        -- Rounded corners
        local mainCorner = Instance.new("UICorner")
        mainCorner.CornerRadius = UDim.new(0, 16)
        mainCorner.Parent = mainFrame

        -- Glassmorphism stroke
        local stroke = Instance.new("UIStroke")
        stroke.Color = Color3.fromRGB(80, 80, 120)
        stroke.Thickness = 1
        stroke.Transparency = 0.5
        stroke.Parent = mainFrame

        -- Animated gradient background
        local gradient = Instance.new("UIGradient")
        gradient.Color = ColorSequence.new{
            ColorSequenceKeypoint.new(0, Color3.fromRGB(30, 30, 50)),
            ColorSequenceKeypoint.new(0.5, Color3.fromRGB(20, 20, 35)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(25, 25, 40))
        }
        gradient.Rotation = 45
        gradient.Parent = mainFrame

        -- Header section
        local headerFrame = Instance.new("Frame")
        headerFrame.Size = UDim2.new(1, 0, 0, 50 * Settings.uiScale)
        headerFrame.Position = UDim2.new(0, 0, 0, 0)
        headerFrame.BackgroundColor3 = Color3.fromRGB(35, 35, 55)
        headerFrame.BackgroundTransparency = 0.3
        headerFrame.BorderSizePixel = 0
        headerFrame.Parent = mainFrame

        local headerCorner = Instance.new("UICorner")
        headerCorner.CornerRadius = UDim.new(0, 16)
        headerCorner.Parent = headerFrame

        -- Title with icon
        local titleLabel = Instance.new("TextLabel")
        titleLabel.Size = UDim2.new(1, -60 * Settings.uiScale, 1, 0)
        titleLabel.Position = UDim2.new(0, 15 * Settings.uiScale, 0, 0)
        titleLabel.BackgroundTransparency = 1
        titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
        titleLabel.TextScaled = true
        titleLabel.Font = Enum.Font.GothamBold
        titleLabel.Text = "🎯 ENHANCED AUTO SKILLCHECK"
        titleLabel.TextXAlignment = Enum.TextXAlignment.Left
        titleLabel.Parent = headerFrame

        -- Status indicator
        local statusIndicator = Instance.new("Frame")
        statusIndicator.Size = UDim2.new(0, 12 * Settings.uiScale, 0, 12 * Settings.uiScale)
        statusIndicator.Position = UDim2.new(1, -25 * Settings.uiScale, 0.5, -6 * Settings.uiScale)
        statusIndicator.BackgroundColor3 = Color3.fromRGB(255, 100, 100)
        statusIndicator.BorderSizePixel = 0
        statusIndicator.Parent = headerFrame

        local indicatorCorner = Instance.new("UICorner")
        indicatorCorner.CornerRadius = UDim.new(0.5, 0)
        indicatorCorner.Parent = statusIndicator

        -- Content container
        local contentFrame = Instance.new("Frame")
        contentFrame.Size = UDim2.new(1, -20 * Settings.uiScale, 1, -70 * Settings.uiScale)
        contentFrame.Position = UDim2.new(0, 10 * Settings.uiScale, 0, 55 * Settings.uiScale)
        contentFrame.BackgroundTransparency = 1
        contentFrame.Parent = mainFrame

        -- Status section
        local statusFrame = Instance.new("Frame")
        statusFrame.Size = UDim2.new(1, 0, 0, 35 * Settings.uiScale)
        statusFrame.Position = UDim2.new(0, 0, 0, 0)
        statusFrame.BackgroundColor3 = Color3.fromRGB(40, 40, 60)
        statusFrame.BackgroundTransparency = 0.4
        statusFrame.BorderSizePixel = 0
        statusFrame.Parent = contentFrame

        local statusCorner = Instance.new("UICorner")
        statusCorner.CornerRadius = UDim.new(0, 8)
        statusCorner.Parent = statusFrame

        local statusLabel = Instance.new("TextLabel")
        statusLabel.Size = UDim2.new(1, -20 * Settings.uiScale, 1, 0)
        statusLabel.Position = UDim2.new(0, 10 * Settings.uiScale, 0, 0)
        statusLabel.BackgroundTransparency = 1
        statusLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
        statusLabel.TextScaled = true
        statusLabel.Font = Enum.Font.GothamBold
        statusLabel.Text = "🔍 SCANNING FOR SKILLCHECK..."
        statusLabel.TextXAlignment = Enum.TextXAlignment.Left
        statusLabel.Parent = statusFrame

        -- Info section with cards
        local infoFrame = Instance.new("Frame")
        infoFrame.Size = UDim2.new(1, 0, 0, 30 * Settings.uiScale)
        infoFrame.Position = UDim2.new(0, 0, 0, 45 * Settings.uiScale)
        infoFrame.BackgroundTransparency = 1
        infoFrame.Parent = contentFrame

        -- Distance info card
        local distanceCard = Instance.new("Frame")
        distanceCard.Size = UDim2.new(0.48, 0, 1, 0)
        distanceCard.Position = UDim2.new(0, 0, 0, 0)
        distanceCard.BackgroundColor3 = Color3.fromRGB(50, 50, 70)
        distanceCard.BackgroundTransparency = 0.3
        distanceCard.BorderSizePixel = 0
        distanceCard.Parent = infoFrame

        local distanceCorner = Instance.new("UICorner")
        distanceCorner.CornerRadius = UDim.new(0, 6)
        distanceCorner.Parent = distanceCard

        local distanceLabel = Instance.new("TextLabel")
        distanceLabel.Size = UDim2.new(1, -10 * Settings.uiScale, 1, 0)
        distanceLabel.Position = UDim2.new(0, 5 * Settings.uiScale, 0, 0)
        distanceLabel.BackgroundTransparency = 1
        distanceLabel.TextColor3 = Color3.fromRGB(100, 255, 150)
        distanceLabel.TextScaled = true
        distanceLabel.Font = Enum.Font.Gotham
        distanceLabel.Text = "📏 Distance: --"
        distanceLabel.Parent = distanceCard

        -- Speed info card
        local speedCard = Instance.new("Frame")
        speedCard.Size = UDim2.new(0.48, 0, 1, 0)
        speedCard.Position = UDim2.new(0.52, 0, 0, 0)
        speedCard.BackgroundColor3 = Color3.fromRGB(50, 50, 70)
        speedCard.BackgroundTransparency = 0.3
        speedCard.BorderSizePixel = 0
        speedCard.Parent = infoFrame

        local speedCorner = Instance.new("UICorner")
        speedCorner.CornerRadius = UDim.new(0, 6)
        speedCorner.Parent = speedCard

        local speedLabel = Instance.new("TextLabel")
        speedLabel.Size = UDim2.new(1, -10 * Settings.uiScale, 1, 0)
        speedLabel.Position = UDim2.new(0, 5 * Settings.uiScale, 0, 0)
        speedLabel.BackgroundTransparency = 1
        speedLabel.TextColor3 = Color3.fromRGB(255, 200, 100)
        speedLabel.TextScaled = true
        speedLabel.Font = Enum.Font.Gotham
        speedLabel.Text = "⚡ Speed: --"
        speedLabel.Parent = speedCard

        -- Progress visualization
        local progressContainer = Instance.new("Frame")
        progressContainer.Size = UDim2.new(1, 0, 0, 35 * Settings.uiScale)
        progressContainer.Position = UDim2.new(0, 0, 0, 85 * Settings.uiScale)
        progressContainer.BackgroundTransparency = 1
        progressContainer.Parent = contentFrame

        -- Progress bar background
        local progressBg = Instance.new("Frame")
        progressBg.Size = UDim2.new(1, 0, 0, 8 * Settings.uiScale)
        progressBg.Position = UDim2.new(0, 0, 0, 0)
        progressBg.BackgroundColor3 = Color3.fromRGB(40, 40, 60)
        progressBg.BorderSizePixel = 0
        progressBg.Parent = progressContainer

        local progressBgCorner = Instance.new("UICorner")
        progressBgCorner.CornerRadius = UDim.new(0, 4)
        progressBgCorner.Parent = progressBg

        -- Animated progress bar
        local progressBar = Instance.new("Frame")
        progressBar.Size = UDim2.new(0, 0, 1, 0)
        progressBar.Position = UDim2.new(0, 0, 0, 0)
        progressBar.BackgroundColor3 = Color3.fromRGB(0, 255, 150)
        progressBar.BorderSizePixel = 0
        progressBar.Parent = progressBg

        local progressCorner = Instance.new("UICorner")
        progressCorner.CornerRadius = UDim.new(0, 4)
        progressCorner.Parent = progressBar

        -- Progress bar glow effect
        local progressGlow = Instance.new("UIStroke")
        progressGlow.Color = Color3.fromRGB(0, 255, 150)
        progressGlow.Thickness = 1
        progressGlow.Transparency = 0.5
        progressGlow.Parent = progressBar

        -- Stats section
        local statsFrame = Instance.new("Frame")
        statsFrame.Size = UDim2.new(1, 0, 0, 25 * Settings.uiScale)
        statsFrame.Position = UDim2.new(0, 0, 0, 15 * Settings.uiScale)
        statsFrame.BackgroundTransparency = 1
        statsFrame.Parent = progressContainer

        local statsLabel = Instance.new("TextLabel")
        statsLabel.Size = UDim2.new(1, 0, 1, 0)
        statsLabel.Position = UDim2.new(0, 0, 0, 0)
        statsLabel.BackgroundTransparency = 1
        statsLabel.TextColor3 = Color3.fromRGB(180, 180, 200)
        statsLabel.TextScaled = true
        statsLabel.Font = Enum.Font.Gotham
        statsLabel.Text = "📊 Success: 0/0 (0%) | Zone: 2° | F6: Toggle"
        statsLabel.Parent = statsFrame

        return gui, statusLabel, distanceLabel, speedLabel, statsLabel, progressBar, mainFrame, statusIndicator
    end)
    
    if success then
        State.isUILoaded = true
        return gui
    else
        warn("UI Creation Failed: " .. tostring(gui))
        State.isUILoaded = false
        return nil
    end
end

-- Safe UI initialization
local gui, statusLabel, distanceLabel, speedLabel, statsLabel, progressBar, mainFrame, statusIndicator

local uiResult = createUI()
if uiResult then
    gui, statusLabel, distanceLabel, speedLabel, statsLabel, progressBar, mainFrame, statusIndicator = uiResult
else
    -- Create minimal UI as fallback
    local fallbackGui = Instance.new("ScreenGui")
    fallbackGui.Name = "AutoSkillcheckFallback"
    fallbackGui.Parent = PlayerGui
    
    local fallbackLabel = Instance.new("TextLabel")
    fallbackLabel.Size = UDim2.new(0, 200, 0, 50)
    fallbackLabel.Position = UDim2.new(0, 10, 0, 10)
    fallbackLabel.BackgroundColor3 = Color3.new(0, 0, 0)
    fallbackLabel.TextColor3 = Color3.new(1, 1, 1)
    fallbackLabel.Text = "Auto Skillcheck: ENABLED"
    fallbackLabel.Parent = fallbackGui
    
    statusLabel = fallbackLabel
end

-- ENHANCED MATH FUNCTIONS
local function getAngleDiff(angle1, angle2)
    local diff = math.abs(angle1 - angle2)
    if diff > 180 then
        diff = 360 - diff
    end
    return diff
end

local function normalizeAngle(angle)
    while angle < 0 do
        angle = angle + 360
    end
    while angle >= 360 do
        angle = angle - 360
    end
    return angle
end

-- IMPROVED APPROACH DISTANCE CALCULATION
local function calculateApproachDistance(needleAngle, targetAngle)
    local normalizedNeedle = normalizeAngle(needleAngle)
    local normalizedTarget = normalizeAngle(targetAngle)
    
    -- Calculate the clockwise distance from needle to target
    local clockwiseDistance
    if normalizedNeedle <= normalizedTarget then
        clockwiseDistance = normalizedTarget - normalizedNeedle
    else
        -- Handle wraparound (needle ahead of target)
        clockwiseDistance = (360 - normalizedNeedle) + normalizedTarget
    end
    
    -- The approach distance is how far the needle is behind the target
    -- When needle is 110° behind target (clockwise), it's optimal to hit
    return clockwiseDistance
end

-- IMPROVED NEEDLE SPEED CALCULATION
local function updateNeedleSpeed(currentAngle)
    -- Store recent needle positions for better speed calculation
    table.insert(State.lastNeedlePositions, {angle = currentAngle, time = tick()})
    
    -- Keep only last 5 positions for speed calculation
    if #State.lastNeedlePositions > 5 then
        table.remove(State.lastNeedlePositions, 1)
    end
    
    -- Calculate speed based on recent positions
    if #State.lastNeedlePositions >= 2 then
        local recent = State.lastNeedlePositions[#State.lastNeedlePositions]
        local previous = State.lastNeedlePositions[#State.lastNeedlePositions - 1]
        
        local timeDiff = recent.time - previous.time
        local angleDiff = math.abs(recent.angle - previous.angle)
        
        -- Handle angle wraparound
        if angleDiff > 180 then
            angleDiff = 360 - angleDiff
        end
        
        local speed = timeDiff > 0 and (angleDiff / timeDiff) or 0
        
        -- Store in speed history for averaging
        table.insert(State.needleSpeedHistory, speed)
        if #State.needleSpeedHistory > 10 then
            table.remove(State.needleSpeedHistory, 1)
        end
        
        -- Return averaged speed
        local totalSpeed = 0
        for _, s in pairs(State.needleSpeedHistory) do
            totalSpeed = totalSpeed + s
        end
        return totalSpeed / #State.needleSpeedHistory
    end
    
    return 0
end

-- UNIVERSAL SKILLCHECK DETECTION
local function getSkillcheck()
    -- Try multiple possible GUI structures with error handling
    local possibleGuis = {
        "SkillCheckPromptGui",
        "SkillCheckGui", 
        "SkillCheck",
        "QTEGui",
        "QuickTimeEvent",
        "SkillcheckGui",
        "QTE"
    }
    
    for _, guiName in pairs(possibleGuis) do
        local success, skillGui = pcall(function()
            return PlayerGui:FindFirstChild(guiName)
        end)
        
        if success and skillGui then
            local enabledSuccess, isEnabled = pcall(function()
                return skillGui.Enabled
            end)
            
            if enabledSuccess and isEnabled then
                local check = skillGui:FindFirstChild("Check") or skillGui:FindFirstChild("Circle") or skillGui:FindFirstChild("Main") or skillGui:FindFirstChild("Frame")
                if check then
                    local visibleSuccess, isVisible = pcall(function()
                        return check.Visible
                    end)
                    
                    if visibleSuccess and isVisible then
                        local needle = check:FindFirstChild("Line") or check:FindFirstChild("Needle") or check:FindFirstChild("Pointer") or check:FindFirstChild("Arrow")
                        local target = check:FindFirstChild("Goal") or check:FindFirstChild("Target") or check:FindFirstChild("Zone") or check:FindFirstChild("Area")
                        
                        if needle and target then
                            local needleVisible, targetVisible
                            pcall(function() needleVisible = needle.Visible end)
                            pcall(function() targetVisible = target.Visible end)
                            
                            if needleVisible ~= false and targetVisible ~= false then
                                return needle, target, check
                            end
                        end
                    end
                end
            end
        end
    end
    
    -- Alternative detection method for different game structures
    pcall(function()
        for _, gui in pairs(PlayerGui:GetChildren()) do
            if gui:IsA("ScreenGui") and gui.Enabled then
                local descendants = gui:GetDescendants()
                for _, desc in pairs(descendants) do
                    if desc:IsA("ImageLabel") or desc:IsA("Frame") then
                        if string.find(string.lower(desc.Name), "needle") or string.find(string.lower(desc.Name), "pointer") then
                            local needle = desc
                            -- Look for target nearby
                            local parent = needle.Parent
                            if parent then
                                local target = parent:FindFirstChild("Target") or parent:FindFirstChild("Goal") or parent:FindFirstChild("Zone")
                                if target then
                                    return needle, target, parent
                                end
                            end
                        end
                    end
                end
            end
        end
    end)
    
    return nil
end

-- ADAPTIVE LEARNING SYSTEM
local function updateStats(distance, wasSuccessful)
    State.totalAttempts = State.totalAttempts + 1
    if wasSuccessful then
        State.successCount = State.successCount + 1
    end
    
    -- Track recent distances for adaptive learning
    table.insert(State.lastDistances, distance)
    if #State.lastDistances > 10 then
        table.remove(State.lastDistances, 1)
    end
    
    -- Calculate average distance
    local sum = 0
    for _, dist in pairs(State.lastDistances) do
        sum = sum + dist
    end
    State.averageDistance = sum / #State.lastDistances
    
    -- Auto-adjust hit zone based on performance
    if Settings.adaptiveMode and State.totalAttempts > 5 then
        local successRate = State.successCount / State.totalAttempts
        if successRate > 0.9 and Settings.hitZone > 6 then
            Settings.hitZone = Settings.hitZone - 1
        elseif successRate < 0.7 and Settings.hitZone < 25 then
            Settings.hitZone = Settings.hitZone + 1
        end
    end
end

-- ENHANCED HIT FUNCTION WITH UNIVERSAL COMPATIBILITY
local function hitSkillcheck(distance)
    if tick() - State.lastHitTime < State.hitCooldown then
        return false
    end
    
    -- Universal input method
    pcall(function()
        sendInput(Enum.KeyCode.Space, true)
        task.wait(0.01)
        sendInput(Enum.KeyCode.Space, false)
    end)
    
    State.lastHitTime = tick()
    
    -- Determine hit quality with modern styling
    local hitQuality = "GOOD"
    local color = Color3.fromRGB(0, 255, 150)
    local emoji = "✅"
    
    if distance <= 3 then
        hitQuality = "PERFECT"
        color = Color3.fromRGB(255, 215, 0)
        emoji = "🎯"
    elseif distance <= 6 then
        hitQuality = "GREAT"
        color = Color3.fromRGB(0, 255, 150)
        emoji = "🔥"
    elseif distance > Settings.hitZone * 0.8 then
        hitQuality = "OK"
        color = Color3.fromRGB(255, 165, 0)
        emoji = "👍"
    end
    
    -- Modern visual feedback (only if UI is loaded)
    if State.isUILoaded then
        pcall(function()
            statusLabel.Text = emoji .. " " .. hitQuality .. " HIT!"
            statusIndicator.BackgroundColor3 = color
            mainFrame.BackgroundColor3 = Color3.new(color.R * 0.2, color.G * 0.2, color.B * 0.2)
            
            -- Smooth scale animation
            local originalSize = mainFrame.Size
            local tween = TweenService:Create(mainFrame, 
                TweenInfo.new(0.15, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                {Size = UDim2.new(0, 400 * Settings.uiScale, 0, 210 * Settings.uiScale)}
            )
            tween:Play()
            
            -- Pulse the progress bar
            local progressPulse = TweenService:Create(progressBar,
                TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = UDim2.new(1, 0, 1, 0)}
            )
            progressPulse:Play()
            
            tween.Completed:Connect(function()
                -- Return to original size
                TweenService:Create(mainFrame,
                    TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                    {Size = originalSize}
                ):Play()
                
                -- Fade progress bar back
                TweenService:Create(progressBar,
                    TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                    {Size = UDim2.new(0, 0, 1, 0)}
                ):Play()
            end)
        end)
    end
    
    updateStats(distance, true)
    
    task.wait(0.6)
    return true
end

-- MAIN LOOP WITH IMPROVED COMPATIBILITY
local connection

connection = RunService.Heartbeat:Connect(function()
    if not Settings.enabled then
        if State.isUILoaded then
            pcall(function()
                statusLabel.Text = "❌ SYSTEM DISABLED"
                distanceLabel.Text = "📏 Distance: --"
                speedLabel.Text = "⚡ Speed: --"
                statusIndicator.BackgroundColor3 = Color3.fromRGB(255, 100, 100)
                mainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
                progressBar.Size = UDim2.new(0, 0, 1, 0)
            end)
        end
        return
    end
    
    local needle, target, skillcheck = getSkillcheck()
    
    if not needle or not target then
        if State.isUILoaded then
            pcall(function()
                statusLabel.Text = "🔍 SCANNING FOR SKILLCHECK..."
                distanceLabel.Text = "📏 Distance: --"
                speedLabel.Text = "⚡ Speed: --"
                statusIndicator.BackgroundColor3 = Color3.fromRGB(255, 165, 0)
                mainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
                progressBar.Size = UDim2.new(0, 0, 1, 0)
            end)
        end
        return
    end
    
    -- Safe angle reading
    local needleAngle, targetAngle
    pcall(function() needleAngle = needle.Rotation end)
    pcall(function() targetAngle = target.Rotation end)
    
    if not needleAngle or not targetAngle then
        return
    end
    
    -- Calculate approach distance using improved method
    local approachDistance = calculateApproachDistance(needleAngle, targetAngle)
    
    -- Update needle speed calculation
    local needleSpeed = updateNeedleSpeed(needleAngle)
    
    -- Dynamic optimal hit distance based on speed
    local baseOptimalDistance = 110 -- Base optimal distance
    local speedAdjustment = 0
    
    -- Adjust optimal distance based on needle speed
    if needleSpeed > 0 then
        -- Faster needle = hit earlier (larger distance)
        -- Slower needle = hit later (smaller distance)
        speedAdjustment = math.min(needleSpeed * 0.5, 15) -- Cap at 15° adjustment
    end
    
    local optimalDistance = baseOptimalDistance + speedAdjustment
    
    -- Calculate how close we are to optimal
    local distanceFromOptimal = math.abs(approachDistance - optimalDistance)
    
    -- Adjust hit zone based on anticipation
    local effectiveHitZone = Settings.hitZone
    if needleSpeed > 5 then
        effectiveHitZone = effectiveHitZone + Settings.anticipationOffset
    end
    
    -- Update UI with improved information
    if State.isUILoaded then
        pcall(function()
            statusLabel.Text = "🎯 TRACKING TARGET"
            distanceLabel.Text = string.format("📏 %.1f° / %.1f°", approachDistance, optimalDistance)
            speedLabel.Text = string.format("⚡ %.1f°/s", needleSpeed)
            statusIndicator.BackgroundColor3 = Color3.fromRGB(0, 255, 150)
            
            local successRate = State.totalAttempts > 0 and (State.successCount / State.totalAttempts * 100) or 0
            statsLabel.Text = string.format("📊 Success: %d/%d (%.1f%%) | Zone: %d° | F6: Toggle", 
                State.successCount, State.totalAttempts, successRate, effectiveHitZone)
            
            -- Progress bar showing proximity to optimal hit zone
            local proximityRatio = math.max(0, 1 - (distanceFromOptimal / 30))
            progressBar.Size = UDim2.new(proximityRatio, 0, 1, 0)
            
            -- Dynamic progress bar color based on proximity
            local progressColor
            if proximityRatio > 0.8 then
                progressColor = Color3.fromRGB(255, 215, 0) -- Gold for perfect
            elseif proximityRatio > 0.6 then
                progressColor = Color3.fromRGB(0, 255, 150) -- Green for great
            elseif proximityRatio > 0.4 then
                progressColor = Color3.fromRGB(255, 165, 0) -- Orange for good
            else
                progressColor = Color3.fromRGB(255, 100, 100) -- Red for poor
            end
            
            progressBar.BackgroundColor3 = progressColor
            progressBar.UIStroke.Color = progressColor
            
            -- Hit detection with improved logic
            if distanceFromOptimal <= effectiveHitZone then
                mainFrame.BackgroundColor3 = Color3.fromRGB(0, 50, 100)
                statusLabel.Text = "🎯 FIRING!"
                statusIndicator.BackgroundColor3 = Color3.fromRGB(255, 215, 0)
                hitSkillcheck(distanceFromOptimal)
            elseif distanceFromOptimal <= effectiveHitZone * 1.5 then
                mainFrame.BackgroundColor3 = Color3.fromRGB(50, 25, 0)
                statusLabel.Text = "⚠️ READY..."
                statusIndicator.BackgroundColor3 = Color3.fromRGB(255, 165, 0)
            else
                mainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
                statusLabel.Text = "🎯 TRACKING TARGET"
                statusIndicator.BackgroundColor3 = Color3.fromRGB(0, 255, 150)
            end
        end)
    else
        -- Minimal UI fallback behavior
        if distanceFromOptimal <= effectiveHitZone then
            hitSkillcheck(distanceFromOptimal)
        end
    end
end)

-- ENHANCED CONTROLS WITH SETTINGS PERSISTENCE
UserInputService.InputBegan:Connect(function(input, processed)
    if processed then return end
    
    if input.KeyCode == Enum.KeyCode.F6 then
        Settings.enabled = not Settings.enabled
        if State.isUILoaded then
            statusLabel.Text = Settings.enabled and "✅ ENABLED" or "❌ DISABLED"
            mainFrame.BackgroundColor3 = Settings.enabled and Color3.fromRGB(0, 200, 0) or Color3.fromRGB(200, 0, 0)
        end
        saveSettings()
        task.wait(1.5)
        
    elseif input.KeyCode == Enum.KeyCode.Equals then
        Settings.hitZone = math.min(Settings.hitZone + 2, 35)
        if State.isUILoaded then
            statusLabel.Text = "Hit Zone: " .. Settings.hitZone .. "°"
            mainFrame.BackgroundColor3 = Color3.fromRGB(0, 150, 200)
        end
        saveSettings()
        task.wait(1)
        
    elseif input.KeyCode == Enum.KeyCode.Minus then
        Settings.hitZone = math.max(Settings.hitZone - 2, 3)
        if State.isUILoaded then
            statusLabel.Text = "Hit Zone: " .. Settings.hitZone .. "°"
            mainFrame.BackgroundColor3 = Color3.fromRGB(0, 150, 200)
        end
        saveSettings()
        task.wait(1)
        
    elseif input.KeyCode == Enum.KeyCode.F9 then
        Settings.adaptiveMode = not Settings.adaptiveMode
        if State.isUILoaded then
            statusLabel.Text = "Adaptive: " .. (Settings.adaptiveMode and "ON" or "OFF")
        end
        saveSettings()
        task.wait(1)
        
    elseif input.KeyCode == Enum.KeyCode.F10 then
        -- Reset stats
        State.successCount = 0
        State.totalAttempts = 0
        State.lastDistances = {}
        State.averageDistance = 0
        State.needleSpeedHistory = {}
        State.lastNeedlePositions = {}
        if State.isUILoaded then
            statusLabel.Text = "Stats Reset"
        end
        task.wait(1)
        
    elseif input.KeyCode == Enum.KeyCode.P then
        connection:Disconnect()
        if gui then
            gui:Destroy()
        end
        print("Enhanced Auto Skillcheck terminated")
        
    elseif input.KeyCode == Enum.KeyCode.F7 then
        local needle, target = getSkillcheck()
        if needle and target then
            local needleAngle, targetAngle
            pcall(function() needleAngle = needle.Rotation end)
            pcall(function() targetAngle = target.Rotation end)
            
            if needleAngle and targetAngle then
                local approachDistance = calculateApproachDistance(needleAngle, targetAngle)
                local speed = updateNeedleSpeed(needleAngle)
                print("=== ENHANCED SKILLCHECK DEBUG ===")
                print("Needle angle:", needleAngle)
                print("Target angle:", targetAngle)
                print("Approach distance:", approachDistance)
                print("Optimal distance:", 110 + (speed * 0.5))
                print("Needle speed:", speed, "°/s")
                print("Hit zone:", Settings.hitZone)
                print("Success rate:", State.totalAttempts > 0 and (State.successCount / State.totalAttempts * 100) or 0, "%")
                print("Average distance:", State.averageDistance)
                print("Adaptive mode:", Settings.adaptiveMode)
                print("VirtualInput available:", VirtualInput ~= nil)
                print("HttpService available:", HttpService ~= nil)
                print("UI Loaded:", State.isUILoaded)
                print("=================================")
            end
        else
            print("No skillcheck found")
        end
        
    elseif input.KeyCode == Enum.KeyCode.F8 then
        -- Manual test
        local needle, target = getSkillcheck()
        if needle and target then
            local needleAngle, targetAngle
            pcall(function() needleAngle = needle.Rotation end)
            pcall(function() targetAngle = target.Rotation end)
            
            if needleAngle and targetAngle then
                local approachDistance = calculateApproachDistance(needleAngle, targetAngle)
                local optimalDistance = 110 + (updateNeedleSpeed(needleAngle) * 0.5)
                local distance = math.abs(approachDistance - optimalDistance)
                hitSkillcheck(distance)
            end
        end
        
    elseif input.KeyCode == Enum.KeyCode.RightBracket then
        Settings.uiScale = math.min(Settings.uiScale + 0.1, 2.0)
        saveSettings()
        if gui then
            gui:Destroy()
            createUI()
        end
        
    elseif input.KeyCode == Enum.KeyCode.LeftBracket then
        Settings.uiScale = math.max(Settings.uiScale - 0.1, 0.5)
        saveSettings()
        if gui then
            gui:Destroy()
            createUI()
        end
    end
end)

print("=== ENHANCED AUTO SKILLCHECK LOADED ===")
print("F6 - Toggle On/Off")
print("F7 - Debug Info") 
print("F8 - Manual Test")
print("F9 - Toggle Adaptive Mode")
print("F10 - Reset Stats")
print("+/- - Adjust Hit Zone")
print("[ ] - Adjust UI Scale")
print("P - Quit")
print("VirtualInput:", VirtualInput and "Available" or "Not Available")
print("HttpService:", HttpService and "Available" or "Not Available")
print("UI Status:", State.isUILoaded and "Loaded" or "Fallback Mode")
print("=========================================")
