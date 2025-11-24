-- Enhanced Auto Skillcheck System
-- Simple UI version with mobile compatibility

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

-- Universal service detection
local VirtualInput
pcall(function()
    VirtualInput = game:GetService("VirtualInputManager")
end)

local player = Players.LocalPlayer
local PlayerGui = player:WaitForChild("PlayerGui")

-- SIMPLIFIED SETTINGS
local Settings = {
    enabled = false, -- Start disabled
    hitZone = 8,
    anticipationOffset = 5,
    adaptiveMode = false,
    showStats = true,
    uiScale = 1,
    positionX = 0.02,
    positionY = 0.3
}

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
    isUILoaded = false,
    isDragging = false,
    dragOffset = Vector2.new(0, 0)
}

-- SIMPLE UI SYSTEM
local function createSimpleUI()
    local success, gui = pcall(function()
        local gui = Instance.new("ScreenGui")
        gui.Name = "SimpleAutoSkillcheck"
        gui.ResetOnSpawn = false
        gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
        gui.Parent = PlayerGui

        -- Main container - simple and clean
        local mainFrame = Instance.new("Frame")
        mainFrame.Size = UDim2.new(0, 220 * Settings.uiScale, 0, 150 * Settings.uiScale)
        mainFrame.Position = UDim2.new(Settings.positionX, 0, Settings.positionY, 0)
        mainFrame.AnchorPoint = Vector2.new(0, 0.5)
        mainFrame.BackgroundColor3 = Color3.fromRGB(25, 25, 35)
        mainFrame.BackgroundTransparency = 0.1
        mainFrame.BorderSizePixel = 0
        mainFrame.Parent = gui

        -- Rounded corners
        local mainCorner = Instance.new("UICorner")
        mainCorner.CornerRadius = UDim.new(0, 8)
        mainCorner.Parent = mainFrame

        -- Simple border
        local stroke = Instance.new("UIStroke")
        stroke.Color = Color3.fromRGB(60, 60, 80)
        stroke.Thickness = 2
        stroke.Parent = mainFrame

        -- Header with title and drag handle
        local headerFrame = Instance.new("Frame")
        headerFrame.Size = UDim2.new(1, 0, 0, 25 * Settings.uiScale)
        headerFrame.Position = UDim2.new(0, 0, 0, 0)
        headerFrame.BackgroundColor3 = Color3.fromRGB(35, 35, 45)
        headerFrame.BorderSizePixel = 0
        headerFrame.Parent = mainFrame

        local headerCorner = Instance.new("UICorner")
        headerCorner.CornerRadius = UDim.new(0, 8)
        headerCorner.Parent = headerFrame

        -- Title
        local titleLabel = Instance.new("TextLabel")
        titleLabel.Size = UDim2.new(1, -40 * Settings.uiScale, 1, 0)
        titleLabel.Position = UDim2.new(0, 8 * Settings.uiScale, 0, 0)
        titleLabel.BackgroundTransparency = 1
        titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
        titleLabel.TextScaled = true
        titleLabel.Font = Enum.Font.GothamMedium
        titleLabel.Text = "Auto Skillcheck"
        titleLabel.TextXAlignment = Enum.TextXAlignment.Left
        titleLabel.Parent = headerFrame

        -- Close button
        local closeButton = Instance.new("TextButton")
        closeButton.Size = UDim2.new(0, 20 * Settings.uiScale, 0, 20 * Settings.uiScale)
        closeButton.Position = UDim2.new(1, -22 * Settings.uiScale, 0.5, -10 * Settings.uiScale)
        closeButton.BackgroundColor3 = Color3.fromRGB(80, 80, 100)
        closeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
        closeButton.Text = "X"
        closeButton.Font = Enum.Font.GothamBold
        closeButton.TextSize = 12 * Settings.uiScale
        closeButton.Parent = headerFrame

        local closeCorner = Instance.new("UICorner")
        closeCorner.CornerRadius = UDim.new(0, 4)
        closeCorner.Parent = closeButton

        -- Content container
        local contentFrame = Instance.new("Frame")
        contentFrame.Size = UDim2.new(1, -16 * Settings.uiScale, 1, -40 * Settings.uiScale)
        contentFrame.Position = UDim2.new(0, 8 * Settings.uiScale, 0, 30 * Settings.uiScale)
        contentFrame.BackgroundTransparency = 1
        contentFrame.Parent = mainFrame

        -- Main toggle button
        local toggleButton = Instance.new("TextButton")
        toggleButton.Size = UDim2.new(1, 0, 0, 35 * Settings.uiScale)
        toggleButton.Position = UDim2.new(0, 0, 0, 0)
        toggleButton.BackgroundColor3 = Color3.fromRGB(180, 50, 50)
        toggleButton.TextColor3 = Color3.fromRGB(255, 255, 255)
        toggleButton.Text = "OFF"
        toggleButton.Font = Enum.Font.GothamBold
        toggleButton.TextSize = 14 * Settings.uiScale
        toggleButton.Parent = contentFrame

        local toggleCorner = Instance.new("UICorner")
        toggleCorner.CornerRadius = UDim.new(0, 6)
        toggleCorner.Parent = toggleButton

        -- Status indicator
        local statusLabel = Instance.new("TextLabel")
        statusLabel.Size = UDim2.new(1, 0, 0, 20 * Settings.uiScale)
        statusLabel.Position = UDim2.new(0, 0, 0, 40 * Settings.uiScale)
        statusLabel.BackgroundTransparency = 1
        statusLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
        statusLabel.Text = "Ready"
        statusLabel.Font = Enum.Font.Gotham
        statusLabel.TextSize = 12 * Settings.uiScale
        statusLabel.TextXAlignment = Enum.TextXAlignment.Left
        statusLabel.Parent = contentFrame

        -- Stats row
        local statsFrame = Instance.new("Frame")
        statsFrame.Size = UDim2.new(1, 0, 0, 40 * Settings.uiScale)
        statsFrame.Position = UDim2.new(0, 0, 0, 65 * Settings.uiScale)
        statsFrame.BackgroundTransparency = 1
        statsFrame.Parent = contentFrame

        -- Success rate
        local successLabel = Instance.new("TextLabel")
        successLabel.Size = UDim2.new(0.6, 0, 1, 0)
        successLabel.Position = UDim2.new(0, 0, 0, 0)
        successLabel.BackgroundTransparency = 1
        successLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
        successLabel.Text = "Success: 0%"
        successLabel.Font = Enum.Font.Gotham
        successLabel.TextSize = 11 * Settings.uiScale
        successLabel.TextXAlignment = Enum.TextXAlignment.Left
        successLabel.Parent = statsFrame

        -- Hit zone
        local zoneLabel = Instance.new("TextLabel")
        zoneLabel.Size = UDim2.new(0.4, 0, 1, 0)
        zoneLabel.Position = UDim2.new(0.6, 0, 0, 0)
        zoneLabel.BackgroundTransparency = 1
        zoneLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
        zoneLabel.Text = "Zone: " .. Settings.hitZone
        zoneLabel.Font = Enum.Font.Gotham
        zoneLabel.TextSize = 11 * Settings.uiScale
        zoneLabel.TextXAlignment = Enum.TextXAlignment.Right
        zoneLabel.Parent = statsFrame

        -- Control buttons frame
        local controlsFrame = Instance.new("Frame")
        controlsFrame.Size = UDim2.new(1, 0, 0, 25 * Settings.uiScale)
        controlsFrame.Position = UDim2.new(0, 0, 0, 110 * Settings.uiScale)
        controlsFrame.BackgroundTransparency = 1
        controlsFrame.Parent = contentFrame

        -- Increase zone button
        local increaseButton = Instance.new("TextButton")
        increaseButton.Size = UDim2.new(0.3, 0, 1, 0)
        increaseButton.Position = UDim2.new(0, 0, 0, 0)
        increaseButton.BackgroundColor3 = Color3.fromRGB(60, 60, 80)
        increaseButton.TextColor3 = Color3.fromRGB(255, 255, 255)
        increaseButton.Text = "+"
        increaseButton.Font = Enum.Font.GothamBold
        increaseButton.TextSize = 14 * Settings.uiScale
        increaseButton.Parent = controlsFrame

        local increaseCorner = Instance.new("UICorner")
        increaseCorner.CornerRadius = UDim.new(0, 4)
        increaseCorner.Parent = increaseButton

        -- Decrease zone button
        local decreaseButton = Instance.new("TextButton")
        decreaseButton.Size = UDim2.new(0.3, 0, 1, 0)
        decreaseButton.Position = UDim2.new(0.35, 0, 0, 0)
        decreaseButton.BackgroundColor3 = Color3.fromRGB(60, 60, 80)
        decreaseButton.TextColor3 = Color3.fromRGB(255, 255, 255)
        decreaseButton.Text = "-"
        decreaseButton.Font = Enum.Font.GothamBold
        decreaseButton.TextSize = 14 * Settings.uiScale
        decreaseButton.Parent = controlsFrame

        local decreaseCorner = Instance.new("UICorner")
        decreaseCorner.CornerRadius = UDim.new(0, 4)
        decreaseCorner.Parent = decreaseButton

        -- Reset stats button
        local resetButton = Instance.new("TextButton")
        resetButton.Size = UDim2.new(0.3, 0, 1, 0)
        resetButton.Position = UDim2.new(0.7, 0, 0, 0)
        resetButton.BackgroundColor3 = Color3.fromRGB(60, 60, 80)
        resetButton.TextColor3 = Color3.fromRGB(255, 255, 255)
        resetButton.Text = "Reset"
        resetButton.Font = Enum.Font.Gotham
        resetButton.TextSize = 11 * Settings.uiScale
        resetButton.Parent = controlsFrame

        local resetCorner = Instance.new("UICorner")
        resetCorner.CornerRadius = UDim.new(0, 4)
        resetCorner.Parent = resetButton

        return gui, mainFrame, toggleButton, statusLabel, successLabel, zoneLabel, 
               increaseButton, decreaseButton, resetButton, closeButton
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
local gui, mainFrame, toggleButton, statusLabel, successLabel, zoneLabel, increaseButton, decreaseButton, resetButton, closeButton

local uiResult = createSimpleUI()
if uiResult then
    gui, mainFrame, toggleButton, statusLabel, successLabel, zoneLabel, increaseButton, decreaseButton, resetButton, closeButton = uiResult
else
    -- Create minimal fallback UI
    local fallbackGui = Instance.new("ScreenGui")
    fallbackGui.Name = "AutoSkillcheckFallback"
    fallbackGui.Parent = PlayerGui
    
    local fallbackButton = Instance.new("TextButton")
    fallbackButton.Size = UDim2.new(0, 100, 0, 40)
    fallbackButton.Position = UDim2.new(0, 10, 0, 10)
    fallbackButton.BackgroundColor3 = Color3.new(0.5, 0, 0)
    fallbackButton.TextColor3 = Color3.new(1, 1, 1)
    fallbackButton.Text = "OFF"
    fallbackButton.Parent = fallbackGui
    
    toggleButton = fallbackButton
end

-- SIMPLE UI UPDATE FUNCTION
local function updateUI()
    if not State.isUILoaded then return end
    
    -- Update toggle button
    if Settings.enabled then
        toggleButton.BackgroundColor3 = Color3.fromRGB(50, 180, 50)
        toggleButton.Text = "ON"
        mainFrame.UIStroke.Color = Color3.fromRGB(0, 150, 0)
    else
        toggleButton.BackgroundColor3 = Color3.fromRGB(180, 50, 50)
        toggleButton.Text = "OFF"
        mainFrame.UIStroke.Color = Color3.fromRGB(60, 60, 80)
    end
    
    -- Update stats
    local successRate = State.totalAttempts > 0 and math.floor((State.successCount / State.totalAttempts) * 100) or 0
    successLabel.Text = "Success: " .. successRate .. "%"
    zoneLabel.Text = "Zone: " .. Settings.hitZone
end

-- UI INTERACTION FUNCTIONS
local function setupUIInteractions()
    if not State.isUILoaded then return end
    
    -- Toggle button
    toggleButton.MouseButton1Click:Connect(function()
        Settings.enabled = not Settings.enabled
        updateUI()
    end)
    
    -- Increase zone button
    increaseButton.MouseButton1Click:Connect(function()
        Settings.hitZone = math.min(Settings.hitZone + 1, 20)
        updateUI()
    end)
    
    -- Decrease zone button
    decreaseButton.MouseButton1Click:Connect(function()
        Settings.hitZone = math.max(Settings.hitZone - 1, 3)
        updateUI()
    end)
    
    -- Reset stats button
    resetButton.MouseButton1Click:Connect(function()
        State.successCount = 0
        State.totalAttempts = 0
        State.lastDistances = {}
        State.averageDistance = 0
        updateUI()
        statusLabel.Text = "Stats Reset"
    end)
    
    -- Close button
    closeButton.MouseButton1Click:Connect(function()
        connection:Disconnect()
        gui:Destroy()
        print("Auto Skillcheck closed")
    end)
    
    -- Drag functionality for PC
    local function startDrag(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            State.isDragging = true
            State.dragOffset = Vector2.new(input.Position.X - mainFrame.AbsolutePosition.X, 
                                         input.Position.Y - mainFrame.AbsolutePosition.Y)
        end
    end
    
    local function stopDrag(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            State.isDragging = false
        end
    end
    
    local function updateDrag(input)
        if State.isDragging then
            local newPos = UDim2.new(0, input.Position.X - State.dragOffset.X, 
                                    0, input.Position.Y - State.dragOffset.Y)
            mainFrame.Position = newPos
        end
    end
    
    -- Connect drag events to header
    mainFrame.Parent:WaitForChild("HeaderFrame", 1):GetPropertyChangedSignal("AbsoluteSize"):Wait()
    local header = mainFrame:FindFirstChild("HeaderFrame")
    if header then
        header.InputBegan:Connect(startDrag)
        header.InputEnded:Connect(stopDrag)
        UserInputService.InputChanged:Connect(updateDrag)
    end
end

-- Initialize UI interactions
setupUIInteractions()
updateUI()

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
    
    local clockwiseDistance
    if normalizedNeedle <= normalizedTarget then
        clockwiseDistance = normalizedTarget - normalizedNeedle
    else
        clockwiseDistance = (360 - normalizedNeedle) + normalizedTarget
    end
    
    return clockwiseDistance
end

-- IMPROVED NEEDLE SPEED CALCULATION
local function updateNeedleSpeed(currentAngle)
    table.insert(State.lastNeedlePositions, {angle = currentAngle, time = tick()})
    
    if #State.lastNeedlePositions > 5 then
        table.remove(State.lastNeedlePositions, 1)
    end
    
    if #State.lastNeedlePositions >= 2 then
        local recent = State.lastNeedlePositions[#State.lastNeedlePositions]
        local previous = State.lastNeedlePositions[#State.lastNeedlePositions - 1]
        
        local timeDiff = recent.time - previous.time
        local angleDiff = math.abs(recent.angle - previous.angle)
        
        if angleDiff > 180 then
            angleDiff = 360 - angleDiff
        end
        
        local speed = timeDiff > 0 and (angleDiff / timeDiff) or 0
        
        table.insert(State.needleSpeedHistory, speed)
        if #State.needleSpeedHistory > 10 then
            table.remove(State.needleSpeedHistory, 1)
        end
        
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
    
    -- Alternative detection
    pcall(function()
        for _, gui in pairs(PlayerGui:GetChildren()) do
            if gui:IsA("ScreenGui") and gui.Enabled then
                local descendants = gui:GetDescendants()
                for _, desc in pairs(descendants) do
                    if desc:IsA("ImageLabel") or desc:IsA("Frame") then
                        if string.find(string.lower(desc.Name), "needle") or string.find(string.lower(desc.Name), "pointer") then
                            local needle = desc
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
    
    table.insert(State.lastDistances, distance)
    if #State.lastDistances > 10 then
        table.remove(State.lastDistances, 1)
    end
    
    local sum = 0
    for _, dist in pairs(State.lastDistances) do
        sum = sum + dist
    end
    State.averageDistance = sum / #State.lastDistances
    
    if Settings.adaptiveMode and State.totalAttempts > 5 then
        local successRate = State.successCount / State.totalAttempts
        if successRate > 0.9 and Settings.hitZone > 6 then
            Settings.hitZone = Settings.hitZone - 1
        elseif successRate < 0.7 and Settings.hitZone < 25 then
            Settings.hitZone = Settings.hitZone + 1
        end
    end
end

-- SIMPLE INPUT FUNCTION
local function sendSpaceInput()
    if VirtualInput then
        VirtualInput:SendKeyEvent(true, Enum.KeyCode.Space, false, game)
        task.wait(0.01)
        VirtualInput:SendKeyEvent(false, Enum.KeyCode.Space, false, game)
    else
        -- Fallback method
        pcall(function()
            game:GetService("UserInputService"):SendKeyEvent(true, "Space", false, nil)
            task.wait(0.01)
            game:GetService("UserInputService"):SendKeyEvent(false, "Space", false, nil)
        end)
    end
end

-- SIMPLE HIT FUNCTION
local function hitSkillcheck(distance)
    if tick() - State.lastHitTime < State.hitCooldown then
        return false
    end
    
    sendSpaceInput()
    State.lastHitTime = tick()
    
    -- Update UI feedback
    if State.isUILoaded then
        local hitQuality = "Good"
        local color = Color3.fromRGB(0, 200, 0)
        
        if distance <= 3 then
            hitQuality = "Perfect"
            color = Color3.fromRGB(255, 215, 0)
        elseif distance <= 6 then
            hitQuality = "Great"
            color = Color3.fromRGB(0, 200, 100)
        end
        
        statusLabel.Text = hitQuality .. " Hit!"
        statusLabel.TextColor3 = color
        
        -- Flash effect
        local originalColor = mainFrame.BackgroundColor3
        mainFrame.BackgroundColor3 = color
        task.spawn(function()
            task.wait(0.3)
            if mainFrame then
                mainFrame.BackgroundColor3 = originalColor
            end
        end)
    end
    
    updateStats(distance, true)
    updateUI()
    
    task.wait(0.6)
    return true
end

-- MAIN LOOP
local connection

connection = RunService.Heartbeat:Connect(function()
    if not Settings.enabled then
        if State.isUILoaded then
            statusLabel.Text = "Disabled"
            statusLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
        end
        return
    end
    
    local needle, target, skillcheck = getSkillcheck()
    
    if not needle or not target then
        if State.isUILoaded then
            statusLabel.Text = "Searching..."
            statusLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
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
    
    -- Calculate approach distance
    local approachDistance = calculateApproachDistance(needleAngle, targetAngle)
    local needleSpeed = updateNeedleSpeed(needleAngle)
    
    -- Dynamic optimal hit distance
    local baseOptimalDistance = 110
    local speedAdjustment = math.min(needleSpeed * 0.5, 15)
    local optimalDistance = baseOptimalDistance + speedAdjustment
    
    -- Calculate how close we are to optimal
    local distanceFromOptimal = math.abs(approachDistance - optimalDistance)
    
    -- Adjust hit zone based on anticipation
    local effectiveHitZone = Settings.hitZone
    if needleSpeed > 5 then
        effectiveHitZone = effectiveHitZone + Settings.anticipationOffset
    end
    
    -- Update UI
    if State.isUILoaded then
        statusLabel.Text = "Tracking"
        statusLabel.TextColor3 = Color3.fromRGB(100, 200, 255)
        updateUI()
    end
    
    -- Hit detection
    if distanceFromOptimal <= effectiveHitZone then
        if State.isUILoaded then
            statusLabel.Text = "Hitting!"
            statusLabel.TextColor3 = Color3.fromRGB(255, 255, 100)
        end
        hitSkillcheck(distanceFromOptimal)
    end
end)

-- KEYBOARD CONTROLS (optional for PC users)
UserInputService.InputBegan:Connect(function(input, processed)
    if processed then return end
    
    if input.KeyCode == Enum.KeyCode.F6 then
        Settings.enabled = not Settings.enabled
        updateUI()
        
    elseif input.KeyCode == Enum.KeyCode.P then
        connection:Disconnect()
        if gui then
            gui:Destroy()
        end
        print("Auto Skillcheck terminated")
        
    elseif input.KeyCode == Enum.KeyCode.F7 then
        -- Debug info
        local needle, target = getSkillcheck()
        if needle and target then
            local needleAngle, targetAngle
            pcall(function() needleAngle = needle.Rotation end)
            pcall(function() targetAngle = target.Rotation end)
            
            if needleAngle and targetAngle then
                local approachDistance = calculateApproachDistance(needleAngle, targetAngle)
                local speed = updateNeedleSpeed(needleAngle)
                print("=== AUTO SKILLCHECK DEBUG ===")
                print("Needle angle:", needleAngle)
                print("Target angle:", targetAngle)
                print("Approach distance:", approachDistance)
                print("Optimal distance:", 110 + (speed * 0.5))
                print("Needle speed:", speed)
                print("Hit zone:", Settings.hitZone)
                print("Success rate:", State.totalAttempts > 0 and (State.successCount / State.totalAttempts * 100) or 0, "%")
                print("=============================")
            end
        else
            print("No skillcheck found")
        end
    end
end)

print("=== SIMPLE AUTO SKILLCHECK LOADED ===")
print("Click the ON/OFF button to start")
print("Use + and - buttons to adjust hit zone")
print("F6 - Toggle On/Off (PC)")
print("F7 - Debug Info (PC)")
print("P - Quit (PC)")
print("Drag the header to move the UI")
print("=====================================")
