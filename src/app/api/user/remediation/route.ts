import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type ActionType = 'assignment' | 'study' | 'review' | 'admin'
type Priority = 'high' | 'medium' | 'low'

interface RemediationAction {
  type: ActionType
  title: string
  description: string
  moduleCode: string
  estimatedHours: number
  priority: Priority
  targetDate: string
}

export async function GET() {
  try {
    // Get all modules with their assignments
    const modules = await prisma.module.findMany({
      include: {
        assignments: true,
      },
    })

    const remediationSuggestions = modules.map(module => {
      const actions: RemediationAction[] = []
      
      // Add assignment actions with dynamic priority based on due date
      const assignmentActions = module.assignments.map(assignment => {
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
        const now = new Date()
        const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
        
        // Determine priority based on due date and completion status
        let priority: Priority = 'medium'
        if (assignment.score === null) { // Not completed
          if (daysUntilDue !== null && daysUntilDue <= 3) {
            priority = 'high' // Due within 3 days
          } else if (daysUntilDue !== null && daysUntilDue <= 7) {
            priority = 'medium' // Due within a week
          } else {
            priority = 'low' // Due later or no due date
          }
        }

        return {
          type: 'assignment' as ActionType,
          title: assignment.title,
          description: `Complete ${assignment.title} for ${module.code}`,
          moduleCode: module.code,
          estimatedHours: 2, // Default for assignments
          priority,
          targetDate: assignment.dueDate?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      })

      actions.push(...assignmentActions)

      // Add study actions
      actions.push({
        type: 'study' as ActionType,
        title: `Review ${module.title}`,
        description: `Review lecture materials and notes for ${module.code}`,
        moduleCode: module.code,
        estimatedHours: 1.5, // Default for study
        priority: 'low' as Priority,
        targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      })

      return {
        moduleCode: module.code,
        moduleTitle: module.title,
        actions,
      }
    })

    // Flatten all actions from all modules for the test
    const allActions = remediationSuggestions.flatMap((suggestion) => 
      suggestion.actions.map((action, actionIndex) => ({
        id: `${suggestion.moduleCode}-${actionIndex}`, // Add id for test compatibility
        ...action,
      }))
    )

    // Sort actions by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const sortedActions = allActions.sort((a, b) => 
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
    )

    return NextResponse.json({
      actions: sortedActions, // Provide the sorted flat array that tests expect
      remediationSuggestions, // Keep the structured format for the UI
      totalActions: sortedActions.length,
    })
  } catch (error) {
    console.error('Error generating remediation suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate remediation suggestions' },
      { status: 500 }
    )
  }
}
